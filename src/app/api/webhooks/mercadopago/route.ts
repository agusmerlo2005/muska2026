import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Forzamos que no se guarde en cache
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔔 WEBHOOK RECIBIDO:', JSON.stringify(body));

    // Mercado Pago manda el ID de diferentes formas según la versión
    const paymentId = body.data?.id || body.resource?.split('/').pop();
    const type = body.type || body.topic;

    if (paymentId && (type === 'payment' || type === 'merchant_order')) {
      
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'User-Agent': 'MuskaHome-App'
        }
      });

      if (!mpResponse.ok) {
        console.error('❌ Error al consultar MP:', await mpResponse.text());
        return NextResponse.json({ error: 'MP Fetch Error' }, { status: 200 });
      }

      const p = await mpResponse.json();

      if (p.status === 'approved') {
        const total = p.transaction_amount;
        const emailCliente = p.payer.email;
        const items = p.additional_info?.items || [];

        const { error: dbError } = await supabase.from('orders').insert([{
          payment_id: paymentId.toString(),
          status: 'approved',
          total_amount: total,
          customer_email: emailCliente,
          customer_name: p.additional_info?.payer?.first_name || 'Cliente Muska',
          items: items,
          created_at: new Date().toISOString()
        }]);

        if (dbError) {
          console.error('❌ Error Supabase:', dbError.message);
        } else {
          console.log('✅ VENTA GUARDADA EN SUPABASE');
          
          // Intentar enviar mail (opcional, si falla no traba la base de datos)
          try {
            await resend.emails.send({
              from: 'Muska Home <onboarding@resend.dev>',
              to: ['muska.homeydeco@gmail.com'], 
              subject: `🔔 VENTA CONFIRMADA - $${total.toLocaleString()}`,
              html: `<p>Nueva venta de <b>${emailCliente}</b> por $${total}</p>`
            });
          } catch (e) {
            console.error('📧 Error enviando mail:', e);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 Error Crítico Webhook:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}