import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, formData, shippingCost } = body;

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
        'Authorization': `Bearer APP_USR-4449479114430550-040619-eb42d08760f62bbaed63c61c3b880976-3318409513`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemsMP,
        payer: {
          name: formData?.name || 'Cliente',
          email: formData?.email || '',
        },
        back_urls: {
          success: `${baseURL}/checkout/success`,
          failure: `${baseURL}/checkout/failure`,
          pending: `${baseURL}/checkout/pending`
        },
        auto_return: "approved",
      }),
    });

    const data = await mpResponse.json();
    return NextResponse.json({ init_point: data.init_point });

  } catch (error: any) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}