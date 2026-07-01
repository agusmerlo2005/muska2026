-- =====================================================================
-- Muska Deco · Limpieza de advisors (Security + Performance)
-- Generado: 2026-07-01
-- Aplicar en: Supabase Dashboard → SQL Editor (o como migración)
-- Todo va dentro de una transacción: si algo falla, no se aplica nada.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. CATEGORIES  (borra 4 SELECT duplicados + admin con initplan)
-- ---------------------------------------------------------------------
drop policy if exists "Allow public select"                      on public.categories;
drop policy if exists "Lectura pública de categorías"            on public.categories;
drop policy if exists "Permitir lectura pública de categorias"   on public.categories;
drop policy if exists "Public profiles are viewable by everyone" on public.categories;
drop policy if exists "Solo Jazmin gestiona categorias"          on public.categories;

create policy "categories_public_read"
  on public.categories for select to anon
  using (true);

create policy "categories_admin_all"
  on public.categories for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

-- ---------------------------------------------------------------------
-- 2. PRODUCTS  (dedupe + ARREGLA email placeholder + público solo activos)
-- ---------------------------------------------------------------------
drop policy if exists "Active products are viewable by everyone" on public.products;
drop policy if exists "Allow public select"                      on public.products;
drop policy if exists "Lectura pública de productos"             on public.products;
drop policy if exists "Permitir lectura pública de productos"    on public.products;
drop policy if exists "Solo admins gestionan productos"          on public.products;

create policy "products_public_read"
  on public.products for select to anon
  using (active = true);

create policy "products_admin_all"
  on public.products for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

-- ---------------------------------------------------------------------
-- 3. PRODUCT_IMAGES
-- ---------------------------------------------------------------------
drop policy if exists "Allow public select"                               on public.product_images;
drop policy if exists "Permitir lectura pública de imagenes de productos"  on public.product_images;
drop policy if exists "Product images are viewable by everyone"           on public.product_images;
drop policy if exists "Solo Jazmin gestiona imagenes"                     on public.product_images;

create policy "product_images_public_read"
  on public.product_images for select to anon
  using (true);

create policy "product_images_admin_all"
  on public.product_images for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

-- ---------------------------------------------------------------------
-- 4. SHIPPING_RATES
-- ---------------------------------------------------------------------
drop policy if exists "Permitir lectura pública de costos de envio" on public.shipping_rates;
drop policy if exists "Shipping rates are viewable by everyone"     on public.shipping_rates;
drop policy if exists "Solo Jazmin gestiona costos de envio"        on public.shipping_rates;

create policy "shipping_rates_public_read"
  on public.shipping_rates for select to anon
  using (true);

create policy "shipping_rates_admin_all"
  on public.shipping_rates for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

-- ---------------------------------------------------------------------
-- 5. ORDERS  (arregla initplan + saca INSERT "WITH CHECK (true)")
--    OJO: los pedidos deben crearse server-side con SERVICE_ROLE.
--    Ver cambio de código en src/app/api/checkout/route.ts.
-- ---------------------------------------------------------------------
drop policy if exists "Usuarios autenticados crean pedidos" on public.orders;
drop policy if exists "Jazmin admin total"                  on public.orders;

create policy "orders_admin_all"
  on public.orders for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');
-- Se mantiene "Lectura pública para seguimiento" (SELECT anon) para /seguimiento.

-- ---------------------------------------------------------------------
-- 6. ORDER_ITEMS  (tabla sin uso en el código: limpiamos duplicados)
-- ---------------------------------------------------------------------
drop policy if exists "Usuarios autenticados crean items de pedido" on public.order_items;
drop policy if exists "Jazmin admin total items"                    on public.order_items;

create policy "order_items_admin_all"
  on public.order_items for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

-- ---------------------------------------------------------------------
-- 7. ÍNDICES faltantes en foreign keys (performance)
-- ---------------------------------------------------------------------
create index if not exists idx_categories_parent_id     on public.categories    (parent_id);
create index if not exists idx_order_items_order_id      on public.order_items    (order_id);
create index if not exists idx_order_items_product_id    on public.order_items    (product_id);
create index if not exists idx_product_images_product_id on public.product_images (product_id);
create index if not exists idx_products_category_id      on public.products       (category_id);
create index if not exists idx_products_subcategory_id   on public.products       (subcategory_id);

-- Índice sin uso (opcional): descomentá si querés eliminarlo.
-- drop index if exists public.idx_orders_customer_email;

-- ---------------------------------------------------------------------
-- 8. STORAGE · bucket "products"  (¡cierra subida/borrado ABIERTOS!)
--    Hoy CUALQUIERA con la anon key puede subir y borrar archivos.
-- ---------------------------------------------------------------------
drop policy if exists "Permitir lectura pública de productos" on storage.objects; -- listing
drop policy if exists "Permitir subida pública"               on storage.objects; -- INSERT abierto a todos
drop policy if exists "Permitir borrado público"              on storage.objects; -- DELETE abierto a todos

create policy "products_admin_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

create policy "products_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

commit;
