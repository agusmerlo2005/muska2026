import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, formData, shippingCost } = body;

    // 1. CONFIGURACIÓN DE URLS (Producción Vercel)
    // Usamos tu dominio real para los retornos de pago
    const baseURL = "https://muskahome.vercel.app";

    // 2. FORMATEAR ITEMS PARA MERCADO PAGO
    const itemsMP = items.map((item: any) => ({
      title: item.name,
      unit_price: Number(item.price),
      quantity: Number(item.quantity),
      currency_id: 'ARS',
    }));

    // Agregar el costo de envío como un item adicional
    if (Number(shippingCost) > 0) {
      itemsMP.push({
        title: `Envío: ${formData.province || 'Domicilio'}`,
        unit_price: Number(shippingCost),
        quantity: 1,
        currency_id: 'ARS',
      });
    }

    // 3. LLAMADA A LA API DE MERCADO PAGO
    // Usamos el Token de producción directamente para asegurar la conexión
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer APP_USR-4449479114430550-040619-eb42d08760f62bbaed63c61c3b880976-3318409513`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemsMP,
        payer: {
          name: formData.name,
          email: formData.email,
          phone: { number: formData.phone },
          address: {
            street_name: formData.address,
            zip_code: formData.zipCode
          }
        },
        back_urls: {
          success: `${baseURL}/checkout/success`,
          failure: `${baseURL}/checkout/failure`,
          pending: `${baseURL}/checkout/pending`
        },
        auto_return: "approved",
        notification_url: `${baseURL}/api/webhooks/mercadopago`,
        statement_descriptor: "MUSKA HOME",
        external_reference: `ORDEN-${Date.now()}`, // Genera un ID único temporal
        binary_mode: true
      }),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('ERROR_MERCADO_PAGO_PROD:', data);
      return NextResponse.json({ 
        error: 'Error en Mercado Pago', 
        details: data.message || data 
      }, { status: 400 });
    }

    // 4. RETORNAR EL LINK DE PAGO (init_point)
    return NextResponse.json({ init_point: data.init_point });

  } catch (error: any) {
    console.error('ERROR_SISTEMA_CHECKOUT:', error);
    return NextResponse.json({ error: 'Error interno de conexión' }, { status: 500 });
  }
}