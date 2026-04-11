import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔍 DATOS RECIBIDOS DE MP:', JSON.stringify(body));

    const paymentId = body.data?.id || body.resource?.split('/').pop();

    if (paymentId) {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          'User-Agent': 'MuskaHome-Admin'
        }
      });

      const p = await mpResponse.json();
      console.log('📋 ESTADO DEL PAGO EN MP:', p.status);

      if (p.status === 'approved') {
        // Extraemos la info que el usuario cargó en el checkout
        const firstName = p.payer?.first_name || '';
        const lastName = p.payer?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const phone = p.payer?.phone?.number || p.additional_info?.payer?.phone?.number || 'Sin teléfono';

        const { error: dbError } = await supabase.from('orders').insert([{
          payment_id: paymentId.toString(),
          status: 'approved',
          total_amount: p.transaction_amount,
          customer_email: p.payer?.email || 'sin-email@test.com',
          customer_name: fullName || 'Cliente Muska',
          customer_phone: phone,
          items: p.additional_info?.items || [],
          created_at: new Date().toISOString()
        }]);

        if (dbError) {
          console.error('❌ ERROR ESPECÍFICO DE SUPABASE:', dbError.message);
          return NextResponse.json({ error: dbError.message }, { status: 200 });
        } 
        
        console.log('✅ VENTA REGISTRADA CON ÉXITO');
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 FALLO CRÍTICO EN WEBHOOK:', error.message);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}