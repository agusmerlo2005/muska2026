import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Consulta publica de seguimiento, por ID de pedido.
 *
 * Existe para que /seguimiento NO tenga que leer la tabla `orders` con la anon
 * key: esa lectura obligaba a una politica RLS de SELECT publico, y con la anon
 * key (que viaja en el bundle) cualquiera podia descargar la tabla entera con
 * mail y telefono de todos los clientes.
 *
 * Aca se usa service_role, pero se devuelve solo lo que la pantalla muestra.
 * El mail, el telefono, los items y el total NO salen de aca.
 *
 * El ID es un UUID v4: 122 bits de entropia, no se puede adivinar a fuerza bruta.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!UUID.test(id)) {
    return NextResponse.json({ error: 'ID invalido' }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('orders')
      .select('id, status, customer_name')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error al buscar pedido:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
