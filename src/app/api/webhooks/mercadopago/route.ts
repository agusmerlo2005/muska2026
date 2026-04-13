import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmation';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

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

        const customerEmail = p.metadata?.client_email || p.payer?.email || 'sin-email@test.com';

        const { error: dbError } = await supabase
          .from('orders')
          .update({
            payment_id: paymentId.toString(),
            status: 'approved',
            total_amount: p.transaction_amount,
            customer_email: customerEmail,
            customer_name: fullName,
            customer_phone: phone,
            items: p.additional_info?.items || [],
          })
          .eq('id', orderId);

        if (dbError) {
          console.error('❌ ERROR ESPECÍFICO DE SUPABASE:', dbError.message);
          return NextResponse.json({ error: dbError.message }, { status: 200 });
        } 

        // ✅ LÓGICA DE DESCUENTO DE STOCK
        const items = p.additional_info?.items || [];
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (product) {
            const newStock = Math.max(0, product.stock - Number(item.quantity));
            await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.id);
          }
        }

        // ✅ ENVIAR EMAIL DE CONFIRMACIÓN
        try {
          await resend.emails.send({
            from: 'Muska Home <onboarding@resend.dev>',
            to: [customerEmail],
            subject: '¡Confirmamos tu pedido en Muska!',
            react: OrderConfirmationEmail({ 
              customerName: fullName, 
              orderId: orderId, 
              total: p.transaction_amount 
            }),
          });
          console.log('📧 EMAIL ENVIADO CON ÉXITO A:', customerEmail);
        } catch (mailError) {
          console.error('❌ ERROR AL ENVIAR EMAIL:', mailError);
        }
        
        console.log('✅ PEDIDO ACTUALIZADO Y STOCK REDUCIDO:', fullName);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 FALLO CRÍTICO EN WEBHOOK:', error.message);
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}