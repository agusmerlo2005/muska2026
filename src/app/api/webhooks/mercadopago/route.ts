import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, type } = body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Consultamos a Mercado Pago para confirmar el estado
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
      });

      const p = await mpResponse.json();

      if (p.status === 'approved') {
        const total = p.transaction_amount;
        const emailCliente = p.payer.email;
        const items = p.additional_info?.items || [];

        // 1. Guardamos la orden en Supabase
        await supabase.from('orders').insert([{
          payment_id: paymentId.toString(),
          status: 'approved',
          total_amount: total,
          customer_email: emailCliente,
          items: items,
          created_at: new Date().toISOString()
        }]);

        // 2. Enviamos el mail a Jazmín
        await resend.emails.send({
          from: 'Muska Home <onboarding@resend.dev>',
          to: ['muska.homeydeco@gmail.com'], 
          subject: `🔔 VENTA CONFIRMADA - $${total.toLocaleString()}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #333;">¡Hola Jazmín! Tenés una nueva venta.</h2>
              <p><strong>Monto total:</strong> $${total}</p>
              <p><strong>Cliente:</strong> ${emailCliente}</p>
              <hr />
              <p style="font-size: 12px; color: #666;">ID de la operación: ${paymentId}</p>
            </div>
          `
        });

        console.log(`✅ Proceso completado para el pago ${paymentId}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error Webhook:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}