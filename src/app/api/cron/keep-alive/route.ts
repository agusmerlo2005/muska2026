import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sin cache: si Vercel sirviera una respuesta cacheada nunca tocariamos Supabase
// y el cron no cumpliria su unico proposito.
export const dynamic = 'force-dynamic';

/**
 * Mantiene despierto el proyecto de Supabase.
 *
 * El plan free no pausa por "cero actividad" sino por actividad *insuficiente*
 * en la ultima semana (la doc habla de "unas cuantas consultas por dia"). Un
 * ping diario no alcanzo: el proyecto se pauso igual en septiembre 2026.
 *
 * Por eso lo dispara cron-job.org cada 3 horas (Vercel Hobby no permite crons de
 * mas de una vez por dia; el de vercel.json queda como respaldo), y cada llamada
 * hace varias consultas reales que devuelven filas, no solo un count.
 *
 * Usa la anon key a proposito: golpea el mismo camino que la tienda publica, asi
 * que si esto falla es que los clientes tampoco pueden ver el catalogo.
 */
export async function GET(request: Request) {
  // Vercel manda este header en los crons cuando CRON_SECRET esta seteado;
  // en cron-job.org hay que cargarlo a mano.
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

    const [products, categories, shippingRates] = await Promise.all([
      supabase.from('products').select('id').limit(10),
      supabase.from('categories').select('id').limit(10),
      supabase.from('shipping_rates').select('id').limit(10),
    ]);

    const failed = [products, categories, shippingRates].find((r) => r.error);
    if (failed?.error) throw failed.error;

    const payload = {
      ok: true,
      filas: {
        products: products.data?.length ?? 0,
        categories: categories.data?.length ?? 0,
        shipping_rates: shippingRates.data?.length ?? 0,
      },
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
