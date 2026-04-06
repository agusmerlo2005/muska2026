import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// 1. CONFIGURACIÓN DEL CLIENTE (Asegurate de tener tu ACCESS TOKEN en el .env)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, formData, total, shippingCost } = body;

    // 2. PREPARAR LOS ITEMS PARA MERCADO PAGO
    // Mapeamos tu carrito al formato que pide la API de MP
    const itemsMP = items.map((item: any) => ({
      id: item.id,
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'ARS',
      picture_url: item.image, // Para que vean la foto en el checkout de MP
    }));

    // 3. AGREGAR EL ENVÍO COMO UN "PRODUCTO" ADICIONAL (Si existe costo)
    if (shippingCost > 0) {
      itemsMP.push({
        id: 'shipping-cost',
        title: `ENVÍO: ${formData.province}`,
        unit_price: Number(shippingCost),
        quantity: 1,
        currency_id: 'ARS',
      });
    }

    // 4. CREAR LA PREFERENCIA DE PAGO
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: itemsMP,
        payer: {
          name: formData.name,
          email: formData.email,
          phone: {
            number: formData.phone,
          },
          address: {
            street_name: formData.address,
            zip_code: formData.city, // Usamos ciudad/postal aquí
          },
        },
        // CONFIGURACIÓN DE RETORNO (Lo que pediste)
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_URL}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_URL}/checkout/pending`,
        },
        auto_return: 'approved', // Redirige solo si el pago es exitoso
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`, // Para automatizar después
        
        // Evitamos que puedan elegir métodos que no querés (opcional)
        payment_methods: {
          installments: 12, // Permitir hasta 12 cuotas
        },
        statement_descriptor: "MUSKA STORE", // Cómo aparece en el resumen de la tarjeta
      },
    });

    // 5. DEVOLVER EL LINK DE PAGO (init_point)
    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error('ERROR_MP_CHECKOUT:', error);
    return NextResponse.json(
      { error: 'Error al crear la preferencia de pago' }, 
      { status: 500 }
    );
  }
}