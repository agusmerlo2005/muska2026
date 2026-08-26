-- ---------------------------------------------------------------------
-- CIERRA LA ESCRITURA PUBLICA DEL BUCKET `products`
--
-- Reemplaza a la seccion 8 de advisor-fixes.sql, que borraba las politicas
-- POR NOMBRE EXACTO: si el nombre real era otro, el `drop ... if exists` no
-- hacia nada, no fallaba, y el script igual terminaba en "Success" con la
-- subida y el borrado abiertos.
--
-- Este script borra por CONTENIDO (cualquier politica de escritura que
-- alcance a anon/public), asi que no depende de como se llame.
--
-- Generado: 2026-08-25 · correr en Supabase Dashboard -> SQL Editor
--
-- =====================================================================
-- YA NO HACE FALTA CORRERLO. Verificado contra produccion el 2026-08-25:
-- el bucket esta CERRADO. storage.objects tiene exactamente dos politicas,
-- products_admin_upload (INSERT) y products_admin_delete (DELETE), las dos
-- para `authenticated` y filtrando por el mail de Jazmin. Ninguna para anon.
-- La seccion 8 de advisor-fixes.sql SI se corrio: quedo registrada como la
-- migracion 20260701232047_advisor_cleanup_rls_indexes_storage.
--
-- El bucket es public = true, asi que las lecturas no necesitan politica y
-- el paso 2.d NO va.
--
-- Se deja el archivo porque los pasos 1 y 3 sirven como diagnostico para
-- reverificar mas adelante.
-- =====================================================================
-- ---------------------------------------------------------------------


-- =====================================================================
-- PASO 1 · DIAGNOSTICO (solo lectura, correr primero y mirar la salida)
-- =====================================================================

-- 1.a Politicas actuales sobre storage.objects.
--     Toda fila con `anon` (o `public`) en roles y cmd INSERT/UPDATE/DELETE/ALL
--     es una puerta abierta.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

-- 1.b IMPORTANTE antes del paso 2: .public define si las fotos se sirven sin
--     policy. Si products tiene public = false, necesitas la politica de
--     lectura del paso 2.d o el catalogo se queda sin imagenes.
select id, name, public, created_at
from storage.buckets
order by name;


-- =====================================================================
-- PASO 2 · CIERRE
--
-- OJO: el bloque 2.a borra las politicas de escritura anon de TODOS los
-- buckets, no solo de products. Mira primero la salida de 1.a: si aparece
-- algun otro bucket que legitimamente necesita escritura anonima, no corras
-- este bloque tal cual, borra a mano solo las de products.
-- =====================================================================

begin;

-- 2.a Borra toda politica de escritura sobre storage.objects que alcance a
--     anon o a public, sin importar el nombre. (roles = {public} es lo que
--     muestra una politica creada sin clausula TO: aplica a todo el mundo.)
do $$
declare
  p record;
  n int := 0;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and roles::text[] && array['anon', 'public']
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
    raise notice 'BORRADA: %', p.policyname;
    n := n + 1;
  end loop;

  if n = 0 then
    raise notice 'No habia politicas de escritura para anon/public. Ya estaba cerrado.';
  else
    raise notice 'Total borradas: %', n;
  end if;
end $$;

-- 2.b Deja limpias las de admin por si una corrida anterior las creo a medias.
drop policy if exists "products_admin_upload" on storage.objects;
drop policy if exists "products_admin_update" on storage.objects;
drop policy if exists "products_admin_delete" on storage.objects;

-- 2.c Solo Jazmin escribe. Incluye UPDATE, que la seccion 8 no cubria: sin
--     esto, una politica anon de UPDATE deja sobreescribir el contenido de
--     una foto existente aunque no se pueda borrar ni subir.
create policy "products_admin_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com'
  );

create policy "products_admin_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com'
  )
  with check (
    bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com'
  );

create policy "products_admin_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com'
  );

-- 2.d SOLO si el paso 1.b mostro products con public = false.
--     Descomentar, si no el catalogo se queda sin imagenes.
--
-- create policy "products_public_read"
--   on storage.objects for select to anon
--   using (bucket_id = 'products');

commit;


-- =====================================================================
-- PASO 3 · COMPROBACION
-- =====================================================================

-- 3.a No tiene que quedar ninguna fila.
select policyname, roles, cmd
from pg_policies
where schemaname = 'storage'
  and tablename  = 'objects'
  and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  and roles::text[] && array['anon', 'public'];

-- 3.b Y estas tres tienen que estar, todas para `authenticated`.
select policyname, roles, cmd
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

-- 3.c LECCION de la auditoria de orders: leer el catalogo de politicas NO es
--     lo mismo que probar el acceso. Verificalo desde afuera, en una ventana
--     de incognito, con la anon key (consola del navegador en el sitio):
--
--     const { data, error } = await supabase.storage.from('products')
--       .upload('test-' + Date.now() + '.txt', new Blob(['x']));
--     console.log({ data, error });
--
--     Tiene que devolver error (403 / "new row violates row-level security
--     policy"). Si devuelve data con un path, sigue abierto.
--     Si sube algo, borra el archivo desde el panel.
