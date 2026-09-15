import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { z } from 'zod';
import { orderConfirmationHtml } from '@/components/emails/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = 'https://muska2026.vercel.app';

// Una persona real no inicia 5 checkouts en 10 minutos; un script si.
const MAX_INTENTOS = 5;
const VENTANA_MS = 10 * 60 * 1000;
const RETENCION_MS = 24 * 60 * 60 * 1000;

/**
 * Registra el intento y dice si esta IP ya se paso del limite.
 *
 * La IP se guarda como HMAC (con la service role key de pepper) para no
 * almacenar IPs en claro. Si se rota la key, los contadores arrancan de cero,
 * que no le hace mal a nadie.
 *
 * Falla abierto: si la tabla no existe o Supabase tira error, se deja pasar.
 * Preferimos aguantar un spam antes que perder una venta por un bug del limite.
 */
async function superaLimite(request: Request, supabase: SupabaseClient): Promise<boolean> {
  try {
    // En Vercel el primer valor de x-forwarded-for es la IP real del cliente.
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'desconocida';

    const ipHash = createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
      .update(ip)
      .digest('hex');

    const ahora = Date.now();

    const { error: insertError } = await supabase
      .from('checkout_attempts')
      .insert({ ip_hash: ipHash });
    if (insertError) throw insertError;

    const { count, error: countError } = await supabase
      .from('checkout_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(ahora - VENTANA_MS).toISOString());
    if (countError) throw countError;

    // Limpieza de lo viejo; si falla no pasa nada, se borra en el proximo intento.
    await supabase
      .from('checkout_attempts')
      .delete()
      .lt('created_at', new Date(ahora - RETENCION_MS).toISOString());

    return (count ?? 0) > MAX_INTENTOS;
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[checkout] limite de intentos no disponible, se deja pasar:', message);
    return false;
  }
}

/**
 * Del carrito aceptamos UNICAMENTE que se compra y cuanta cantidad.
 *
 * El precio NO se acepta del cliente: el carrito vive en localStorage, asi que
 * cualquiera puede editarlo con devtools y pagar lo que quiera. Los precios se
 * leen de la base mas abajo. Las claves de mas que manda el carrito (name,
 * price, image, slug, stock) las descarta zod solo.
 */
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1)
    .max(50),
  formData: z
    .object({
      name: z.string().trim().max(120).optional(),
      email: z.union([z.string().trim().email().max(200), z.literal('')]).optional(),
      phone: z.string().trim().max(40).optional(),
      province: z.string().trim().max(80).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Antes de validar nada: los intentos con body invalido tambien cuentan.
    if (await superaLimite(request, supabase)) {
      return NextResponse.json(
        { error: 'Hiciste muchos intentos seguidos. Espera unos minutos y proba de nuevo.' },
        { status: 429 }
      );
    }

    const parsed = checkoutSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: 'El pedido no es valido.' }, { status: 400 });
    }

    const { items, formData } = parsed.data;

    // Agrupamos por id: si mandan el mismo producto en varias lineas, cuenta
    // como una sola cantidad y el chequeo de stock no se puede esquivar.
    const pedidas = new Map<string, number>();
    for (const item of items) {
      pedidas.set(item.id, (pedidas.get(item.id) ?? 0) + item.quantity);
    }

    // FUENTE DE VERDAD: precio y stock salen de la base, no del navegador.
    const { data: productos, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', Array.from(pedidas.keys()));

    if (productsError) {
      console.error('Error al leer productos:', productsError);
      return NextResponse.json({ error: 'No pudimos validar el pedido.' }, { status: 500 });
    }

    const lineas: { id: string; name: string; price: number; quantity: number }[] = [];

    for (const [id, quantity] of Array.from(pedidas.entries())) {
      const producto = productos?.find((p) => p.id === id);

      if (!producto) {
        return NextResponse.json(
          { error: 'Uno de los productos ya no esta disponible. Actualiza el carrito.' },
          { status: 400 }
        );
      }

      if (Number(producto.stock) < quantity) {
        return NextResponse.json(
          {
            error: `Nos queda${Number(producto.stock) === 1 ? '' : 'n'} ${producto.stock} de "${producto.name}" y estas pidiendo ${quantity}.`,
          },
          { status: 409 }
        );
      }

      lineas.push({
        id: producto.id,
        name: producto.name,
        price: Number(producto.price),
        quantity,
      });
    }

    // El envio tampoco se toma del body. Hoy es siempre retiro en local; cuando
    // se active el envio hay que resolverlo contra la tabla shipping_rates aca.
    const shippingCost = 0;
    const total = lineas.reduce((acc, l) => acc + l.price * l.quantity, 0) + shippingCost;

    // 1. CREAR EL PEDIDO EN LA DB (con los numeros calculados por el servidor)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: formData?.name || 'Cliente Muska',
        customer_email: formData?.email || '',
        customer_phone: formData?.phone || '',
        items: lineas,
        total_amount: total,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error al insertar en Supabase:', orderError);
      return NextResponse.json({ error: 'Error al registrar el pedido' }, { status: 500 });
    }

    // 1.b ENVIAR EL ID DE SEGUIMIENTO POR MAIL (apenas se crea el pedido,
    //     así el cliente no lo pierde aunque cierre la página o el pago quede pendiente)
    if (formData?.email) {
      try {
        await resend.emails.send({
          from: 'Muska Home <onboarding@resend.dev>',
          to: [formData.email],
          subject: 'Recibimos tu pedido en Muska · Guardá tu ID de seguimiento',
          html: orderConfirmationHtml({
            customerName: formData?.name || 'Cliente Muska',
            orderId: order.id,
            total,
            trackingUrl: `${BASE_URL}/seguimiento?id=${order.id}`,
            intro:
              'Recibimos tu pedido correctamente. Cuando se acredite el pago te lo confirmamos por este mismo medio. Mientras tanto, guardá tu ID de seguimiento:',
          }),
        });
      } catch (mailError) {
        // Si falla el mail, no cortamos el checkout: el pedido igual se creó.
        console.error('Error Resend (checkout):', mailError);
      }
    }

    // 2. PREFERENCIA DE MERCADO PAGO, con los precios de la base
    const itemsMP = lineas.map((l) => ({
      id: l.id, // ID DE SUPABASE PARA EL WEBHOOK
      title: l.name,
      unit_price: l.price,
      quantity: l.quantity,
      currency_id: 'ARS',
    }));

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemsMP,
        external_reference: order.id,
        payer: {
          name: formData?.name || 'Cliente',
          email: formData?.email || '',
          phone: { number: formData?.phone || '' },
        },
        back_urls: {
          success: `${BASE_URL}/checkout/success`,
          failure: `${BASE_URL}/checkout/failure`,
          pending: `${BASE_URL}/checkout/pending`,
        },
        auto_return: 'approved',
        metadata: {
          order_id: order.id,
          client_name: formData?.name,
          client_email: formData?.email,
          client_phone: formData?.phone,
        },
        notification_url: `${BASE_URL}/api/webhooks/mercadopago`,
        statement_descriptor: 'MUSKA HOME',
      }),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Error MP:', data);
      return NextResponse.json({ error: 'Error al crear preferencia' }, { status: mpResponse.status });
    }

    return NextResponse.json({ init_point: data.init_point });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
