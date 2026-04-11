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

    // Capturamos el ID del pago
    const paymentId = body.data?.id || body.resource?.split('/').pop();
    
    if (!paymentId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 1. Consultamos a MP
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'User-Agent': 'MuskaHome'
      }
    });

    if (!mpResponse.ok) {
      console.error('❌ Error MP API:', await mpResponse.text());
      return NextResponse.json({ error: 'MP API Error' }, { status: 200 });
    }

    const p = await mpResponse.json();

    if (p.status === 'approved') {
      const total = p.transaction_amount;
      const emailCliente = p.payer.email;
      const items = p.additional_info?.items || [];

      // 2. GUARDAR EN SUPABASE (Prioridad #1)
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
        console.error('❌ ERROR SUPABASE:', dbError.message);
        // Si falla la base, tiramos error para que MP reintente
        return NextResponse.json({ error: 'DB Error' }, { status: 500 });
      }

      console.log('✅ VENTA GUARDADA EN TABLA ORDERS');

      // 3. ENVIAR MAIL (Prioridad #2 - En un bloque separado para que no rompa lo anterior)
      try {
        await resend.emails.send({
          from: 'Muska Home <onboarding@resend.dev>',
          to: ['muska.homeydeco@gmail.com'], // Asegurate que este mail esté verificado en Resend
          subject: `🔔 NUEVA VENTA - $${total}`,
          html: `
            <div style="font-family:sans-serif; border:1px solid #000; padding:20px;">
              <h1>¡Nueva venta confirmada!</h1>
              <p><b>Cliente:</b> ${emailCliente}</p>
              <p><b>Monto:</b> $${total}</p>
              <p>Revisá el panel de administración para ver los detalles.</p>
            </div>
          `
        });
        console.log('📧 Mail enviado con éxito');
      } catch (mailErr) {
        // Si el mail falla, NO importa, porque la venta ya se guardó en el paso 2
        console.error('⚠️ Error al enviar mail (pero la venta se guardó):', mailErr);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 ERROR CRÍTICO:', error.message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}