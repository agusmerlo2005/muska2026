import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sin cache: si Vercel sirviera una respuesta cacheada nunca tocariamos Supabase
// y el cron no cumpliria su unico proposito.
export const dynamic = 'force-dynamic';

/**
 * Mantiene despierto el proyecto de Supabase.
 *
 * El plan free pausa el proyecto a los 7 dias sin actividad, y despertarlo es
 * manual desde el dashboard: mientras tanto la tienda queda caida. Este endpoint
 * hace una consulta minima una vez por dia para que ese contador nunca llegue.
 *
 * Usa la anon key a proposito: golpea el mismo camino que la tienda publica, asi
 * que si esto falla es que los clientes tampoco pueden ver el catalogo.
 */
export async function GET(request: Request) {
  // Vercel manda este header en los crons cuando CRON_SECRET esta seteado.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const startedAt = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error, count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;

    const payload = {
      ok: true,
      productos: count,
      ms: Date.now() - startedAt,
      at: new Date().toISOString(),
    };

    console.log('[keep-alive] Supabase OK', payload);
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Se loguea como error para que salte en los logs de Vercel: si esto falla
    // varios dias seguidos, el proyecto se va a pausar igual.
    console.error('[keep-alive] Supabase FALLO:', message);

    return NextResponse.json(
      { ok: false, error: message, ms: Date.now() - startedAt },
      { status: 500 }
    );
  }
}
