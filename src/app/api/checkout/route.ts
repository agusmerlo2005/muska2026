import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { orderConfirmationHtml } from '@/components/emails/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, formData, shippingCost, total } = body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const baseURL = "https://muska2026.vercel.app";

    // El pedido se crea server-side con SERVICE_ROLE: seguro y sin exponer
    // un INSERT abierto en las políticas RLS de la tabla orders.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. CREAR EL PEDIDO EN LA DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: formData?.name || 'Cliente Muska',
        customer_email: formData?.email || '',
        customer_phone: formData?.phone || '',
        items: items,
        total_amount: Number(total),
        status: 'pending' 
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
            total: Number(total),
            trackingUrl: `${baseURL}/seguimiento?id=${order.id}`,
            intro: 'Recibimos tu pedido correctamente. Cuando se acredite el pago te lo confirmamos por este mismo medio. Mientras tanto, guardá tu ID de seguimiento:',
          }),
        });
      } catch (mailError) {
        // Si falla el mail, no cortamos el checkout: el pedido igual se creó.
        console.error('Error Resend (checkout):', mailError);
      }
    }

    // 2. PREPARAR ITEMS PARA MERCADO PAGO
    const itemsMP = items.map((item: any) => ({
      id: item.id, // ID DE SUPABASE PARA EL WEBHOOK
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'ARS',
    }));

    if (Number(shippingCost) > 0) {
      itemsMP.push({
        id: 'shipping-cost',
        title: `Envío: ${formData?.province || 'Domicilio'}`,
        unit_price: Number(shippingCost),
        quantity: 1,
        currency_id: 'ARS',
      });
    }

    // 3. CREAR PREFERENCIA EN MERCADO PAGO
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemsMP,
        external_reference: order.id, 
        payer: {
          name: formData?.name || 'Cliente',
          email: formData?.email || '',
          phone: {
            number: formData?.phone || ""
          }
        },
        back_urls: {
          success: `${baseURL}/checkout/success`,
          failure: `${baseURL}/checkout/failure`,
          pending: `${baseURL}/checkout/pending`
        },
        auto_return: "approved",
        metadata: {
          order_id: order.id,
          client_name: formData?.name,
          client_email: formData?.email,
          client_phone: formData?.phone
        },
        notification_url: `${baseURL}/api/webhooks/mercadopago`,
        statement_descriptor: "MUSKA HOME",
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