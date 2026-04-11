import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, formData, shippingCost } = body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const baseURL = "https://muska2026.vercel.app";

    const itemsMP = items.map((item: any) => ({
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'ARS',
    }));

    if (Number(shippingCost) > 0) {
      itemsMP.push({
        title: `Envío: ${formData?.province || 'Domicilio'}`,
        unit_price: Number(shippingCost),
        quantity: 1,
        currency_id: 'ARS',
      });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemsMP,
        payer: {
          name: formData?.name || 'Cliente',
          surname: formData?.lastName || '', 
          email: formData?.email || '',
          phone: {
            area_code: "",
            number: formData?.phone || ""
          },
          address: {
            street_name: formData?.address || "",
            zip_code: formData?.zipCode || ""
          }
        },
        back_urls: {
          success: `${baseURL}/checkout/success`,
          failure: `${baseURL}/checkout/failure`,
          pending: `${baseURL}/checkout/pending`
        },
        auto_return: "approved",
        // ✅ CAMBIO CLAVE: Reforzamos metadata con nombre y teléfono exactos
        metadata: {
          client_name: formData?.name, // El nombre completo que Jazmín necesita ver
          client_email: formData?.email,
          client_phone: formData?.phone, // Guardamos el teléfono aquí también por seguridad
          shipping_type: formData?.shippingType
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