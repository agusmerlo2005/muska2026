import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// 1. CONFIGURACIÓN DE CLIENTES
// Usamos Service Role Key para tener permisos de escritura en la DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend('re_Av2Jh3wq_K8ujwY8KZ9nFsjt8yfLT88Ga');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, type } = body;

    // Solo procesamos si la notificación es de un pago
    if (type === 'payment') {
      const paymentId = data.id;
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN; // ✅ Token real desde Vercel

      // 2. CONSULTAR DETALLES A MERCADO PAGO
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!mpResponse.ok) {
        throw new Error('No se pudo obtener el detalle del pago de Mercado Pago');
      }

      const p = await mpResponse.json();

      // Solo actuamos si el pago está aprobado
      if (p.status === 'approved') {
        const total = p.transaction_amount;
        const emailCliente = p.payer.email;
        const items = p.additional_info?.items || [];
        const externalRef = p.external_reference;

        // 3. GUARDAR EN TU BASE DE DATOS (SUPABASE)
        // Nota: Asegurate que tu tabla 'orders' tenga estas columnas exactas
        const { error: dbError } = await supabase.from('orders').insert([{
          payment_id: paymentId.toString(),
          status: 'approved',
          total_amount: total,
          customer_email: emailCliente,
          items: items,
          external_reference: externalRef,
          created_at: new Date().toISOString()
        }]);

        if (dbError) {
          console.error('Error Supabase al insertar orden:', dbError);
        }

        // 4. ARMAR EL CUERPO DEL MAIL PARA JAZMÍN
        const listaProductos = items.length > 0 
          ? items.map((i: any) => `<li>${i.quantity}x ${i.title} - $${i.unit_price}</li>`).join('')
          : '<li>Ver detalle en Mercado Pago</li>';

        // 5. ENVIAR EL MAIL AUTOMÁTICO A JAZMÍN
        await resend.emails.send({
          from: 'Muska Home <onboarding@resend.dev>',
          to: ['muska.homeydeco@gmail.com'],
          subject: `🔔 NUEVA VENTA CONFIRMADA - $${total.toLocaleString()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #000; padding: 20px;">
              <h1 style="text-align: center; text-transform: uppercase; font-style: italic; letter-spacing: -1px;">¡Nueva Venta!</h1>
              <p style="text-align: center; font-size: 12px; color: #666; text-transform: uppercase;">Muska Home & Deco - Sistema Automático</p>
              
              <hr style="border: 1px solid #000; margin: 20px 0;" />
              
              <h3 style="text-transform: uppercase; font-size: 14px;">Detalle de la Orden:</h3>
              <ul style="padding-left: 20px; line-height: 1.6;">
                ${listaProductos}
              </ul>
              
              <p style="font-size: 22px; font-weight: bold; margin-top: 20px;">
                Total Pagado: $${total.toLocaleString()}
              </p>

              <div style="background: #f4f4f4; padding: 15px; margin-top: 20px;">
                <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase;">Datos del Cliente:</h3>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${emailCliente}</p>
                <p style="margin: 5px 0;"><strong>Referencia:</strong> ${externalRef || 'Sin referencia'}</p>
                <p style="margin: 5px 0;"><strong>ID de Pago:</strong> ${paymentId}</p>
              </div>

              <p style="font-size: 10px; color: #999; margin-top: 30px; text-align: center;">
                Este es un aviso automático de tu tienda Muska Home.
              </p>
            </div>
          `,
        });

        console.log(`✅ Pedido ${paymentId} procesado con éxito.`);
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('Error Crítico Webhook:', error.message);
    // Respondemos 200 de todos modos para que MP no siga reintentando si el error es de lógica
    return NextResponse.json({ status: 'error_logged' }, { status: 200 });
  }
}