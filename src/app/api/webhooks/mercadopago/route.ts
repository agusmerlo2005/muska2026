import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmation';

export const dynamic = 'force-dynamic';

// Usamos SERVICE_ROLE para poder saltar RLS y actualizar stock internamente
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Capturamos el ID del pago
    const paymentId = body.data?.id || (body.type === 'payment' ? body.id : null);

    if (paymentId) {
      // ✅ ESCUDO 1: VERIFICACIÓN CONTRA API OFICIAL (Ya lo tenías, mantenido)
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });

      if (!mpResponse.ok) throw new Error('Error al consultar pago en MP');
      
      const p = await mpResponse.json();
      const orderId = p.external_reference;

      // ✅ ESCUDO 2: VERIFICAR QUE EL PAGO NO HAYA SIDO PROCESADO YA
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (existingOrder?.status === 'approved') {
        return NextResponse.json({ message: 'Pago ya procesado' }, { status: 200 });
      }

      // Lógica principal
      if (p.status === 'approved' && orderId) {
        const fullName = p.metadata?.client_name || p.additional_info?.payer?.first_name || 'Cliente Muska';
        const customerEmail = p.metadata?.client_email || p.payer?.email;

        // 1. ACTUALIZAR ORDEN EN SUPABASE
        const { error: dbError } = await supabase
          .from('orders')
          .update({
            payment_id: paymentId.toString(),
            status: 'approved',
            customer_name: fullName,
            customer_email: customerEmail,
          })
          .eq('id', orderId);

        if (dbError) console.error('Error DB:', dbError.message);

        // 2. LÓGICA DE DESCUENTO DE STOCK
        const items = p.additional_info?.items || [];
        for (const item of items) {
          if (item.id === 'shipping-cost') continue;

          // Buscamos el stock actual
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

        // 3. ENVIAR EMAIL DE CONFIRMACIÓN
        if (customerEmail) {
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
          } catch (mailError) {
            console.error('Error Resend:', mailError);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 FALLO CRÍTICO EN WEBHOOK:', error.message);
    // Respondemos 200 para que MP no siga intentando si es un error de código
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}