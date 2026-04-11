import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

    // Capturamos el ID del pago sea cual sea el formato que mande MP
    const paymentId = body.data?.id || body.resource?.split('/').pop();
    
    // Si no hay ID, no podemos hacer nada
    if (!paymentId) {
      return NextResponse.json({ received: true, message: 'No payment ID' }, { status: 200 });
    }

    // Consultamos a Mercado Pago para confirmar los datos reales del pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'User-Agent': 'MuskaHome-App'
      }
    });

    if (!mpResponse.ok) {
      console.error('❌ Error MP API:', await mpResponse.text());
      return NextResponse.json({ error: 'MP API Error' }, { status: 200 });
    }

    const p = await mpResponse.json();

    // SOLO guardamos si el pago está aprobado
    if (p.status === 'approved') {
      const total = p.transaction_amount;
      const emailCliente = p.payer.email;
      const items = p.additional_info?.items || [];

      // Insertamos en Supabase con los nombres exactos de tus columnas
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
        console.error('❌ Error Supabase al insertar:', dbError.message);
      } else {
        console.log('✅ VENTA GUARDADA EXITOSAMENTE');
        
        // Enviamos el mail a Jazmín (opcional)
        try {
          await resend.emails.send({
            from: 'Muska Home <onboarding@resend.dev>',
            to: ['muska.homeydeco@gmail.com'], 
            subject: `🔔 VENTA CONFIRMADA - $${total.toLocaleString()}`,
            html: `<p>Nueva venta de <b>${emailCliente}</b> por $${total}</p>`
          });
        } catch (mailErr) {
          console.error('📧 Error mail:', mailErr);
        }
      }
    } else {
      console.log(`ℹ️ Pago recibido pero estado es: ${p.status}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 ERROR CRÍTICO:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}