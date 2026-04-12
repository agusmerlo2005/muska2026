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

      // ✅ Usamos el external_reference para encontrar el pedido que ya creaste en el checkout
      const orderId = p.external_reference;

      if (p.status === 'approved' && orderId) {
        const metadataName = p.metadata?.client_name;
        const infoName = p.additional_info?.payer?.first_name 
          ? `${p.additional_info.payer.first_name} ${p.additional_info.payer.last_name || ''}` 
          : null;
        const payerName = p.payer?.first_name 
          ? `${p.payer.first_name} ${p.payer.last_name || ''}` 
          : null;

        const fullName = (metadataName || infoName || payerName || 'Cliente Muska').trim();
        
        const phone = p.metadata?.client_phone || 
                      p.payer?.phone?.number || 
                      p.additional_info?.payer?.phone?.number || 
                      'Sin teléfono';

        // ✅ CAMBIO: De .insert() a .update() usando el ID de la orden
        const { error: dbError } = await supabase
          .from('orders')
          .update({
            payment_id: paymentId.toString(),
            status: 'approved',
            total_amount: p.transaction_amount,
            customer_email: p.metadata?.client_email || p.payer?.email || 'sin-email@test.com',
            customer_name: fullName,
            customer_phone: phone,
            items: p.additional_info?.items || [],
            // No reseteamos el created_at para mantener la fecha original del pedido
          })
          .eq('id', orderId); // Buscamos la fila que ya existe

        if (dbError) {
          console.error('❌ ERROR ESPECÍFICO DE SUPABASE:', dbError.message);
          return NextResponse.json({ error: dbError.message }, { status: 200 });
        } 
        
        console.log('✅ PEDIDO ACTUALIZADO CON ÉXITO:', fullName);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 FALLO CRÍTICO EN WEBHOOK:', error.message);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}