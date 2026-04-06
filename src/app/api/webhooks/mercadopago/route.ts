import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // 1. Mercado Pago nos avisa que cambió el estado de un pago
  // 2. Verificamos si es 'approved'
  // 3. Si es approved, disparamos el mail a Jazmín y al cliente
  // 4. Actualizamos el estado en Supabase a 'paid'

  return NextResponse.json({ received: true });
}