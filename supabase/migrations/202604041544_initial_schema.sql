-- =====================================================================
-- Muska Deco · Esquema inicial
--
-- RECONSTRUIDO el 2026-08-25 leyendo el catalogo de la base de produccion
-- (proyecto cotsloxnmdadvmvqhdkn) via MCP. El archivo estaba VACIO: el
-- esquema real solo vivia en Supabase.
--
-- OJO: esto es un SNAPSHOT DEL ESTADO ACTUAL, no el historial de como se
-- llego hasta aca. Sirve para levantar un entorno nuevo desde cero; NO
-- sirve para replicar el orden en que se aplicaron los cambios.
--
-- Ya incluye las politicas que dejo la migracion
-- 20260701232047_advisor_cleanup_rls_indexes_storage, mas los cierres
-- posteriores de `orders` (2026-08-25) y de `order_items`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABLAS
-- ---------------------------------------------------------------------

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz default now(),
  parent_id  uuid references public.categories(id) on delete cascade
);

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text,
  price          numeric(12,2) not null check (price >= 0),
  stock          integer not null default 0 check (stock >= 0),
  category_id    uuid references public.categories(id) on delete set null,
  active         boolean default true,
  slug           text unique,
  created_at     timestamptz default now(),
  -- `image` es legado: el codigo usa `image_url`. Ver nota al final.
  image          text,
  image_url      text,
  subcategory_id uuid references public.categories(id) on delete set null,
  is_featured    boolean default false
);

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete cascade,
  url         text not null,
  order_index integer default 0,
  created_at  timestamptz default now()
);

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now(),
  customer_name    text,
  customer_email   text not null,
  customer_phone   text,
  total_amount     numeric(12,2) not null,
  status           text default 'pending',
  shipping_address text,
  -- `payment_id` es unique: es lo que hace idempotente al webhook de MP.
  payment_id       text unique,
  -- Los items del pedido viven ACA como JSON, no en order_items.
  items            jsonb
);

-- NOTA: `order_items` existe pero esta VACIA y sin uso en el codigo (los
-- items se guardan en orders.items). Se mantiene por si algun dia se
-- normaliza. Si se empieza a usar, revisar sus politicas RLS.
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid references public.orders(id) on delete cascade,
  product_id        uuid references public.products(id),
  quantity          integer not null,
  price_at_purchase numeric(12,2) not null
);

create table if not exists public.shipping_rates (
  id         uuid primary key default gen_random_uuid(),
  zip_code   text not null unique,
  cost       numeric(12,2) not null check (cost >= 0),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- INDICES (los de FK vienen de la migracion de advisors)
-- ---------------------------------------------------------------------

create index if not exists idx_categories_parent_id     on public.categories    (parent_id);
create index if not exists idx_products_category_id     on public.products      (category_id);
create index if not exists idx_products_subcategory_id  on public.products      (subcategory_id);
create index if not exists idx_product_images_product_id on public.product_images (product_id);
create index if not exists idx_order_items_order_id     on public.order_items   (order_id);
create index if not exists idx_order_items_product_id   on public.order_items   (product_id);
create index if not exists idx_orders_customer_email    on public.orders        (customer_email);

-- ---------------------------------------------------------------------
-- RLS
--
-- IMPORTANTE: los roles `anon` y `authenticated` tienen GRANTS completos de
-- DML sobre todas estas tablas (es el default de Supabase). O sea que RLS es
-- lo UNICO que separa a un visitante anonimo de escribir en la base. Si se
-- apaga RLS en cualquiera de estas tablas, queda abierta de par en par.
-- ---------------------------------------------------------------------

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.shipping_rates enable row level security;

-- Catalogo: lectura publica. `products` solo expone los activos.
create policy "categories_public_read"
  on public.categories for select to anon using (true);

create policy "products_public_read"
  on public.products for select to anon using (active = true);

create policy "product_images_public_read"
  on public.product_images for select to anon using (true);

create policy "shipping_rates_public_read"
  on public.shipping_rates for select to anon using (true);

-- Pedidos: NADA para anon.
-- Se crean server-side con service_role (bypassea RLS) desde
-- src/app/api/checkout/route.ts, y /seguimiento lee via /api/orders/[id].
-- No agregar politicas anon aca: la tabla tiene mail, telefono y direccion.

-- Admin (Jazmin) sobre todo. El `(select auth.jwt())` envuelto es a
-- proposito: sin el, Postgres re-evalua la funcion por fila (initplan).
create policy "categories_admin_all"
  on public.categories for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

create policy "products_admin_all"
  on public.products for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

create policy "product_images_admin_all"
  on public.product_images for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

create policy "orders_admin_all"
  on public.orders for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

create policy "order_items_admin_all"
  on public.order_items for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

create policy "shipping_rates_admin_all"
  on public.shipping_rates for all to authenticated
  using      (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com')
  with check (((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

-- ---------------------------------------------------------------------
-- STORAGE · bucket "products"
--
-- El bucket es PUBLICO (storage.buckets.public = true), asi que las lecturas
-- se sirven sin pasar por policy: no hace falta una politica de SELECT.
-- Las de escritura si, y son solo para la admin.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "products_admin_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

create policy "products_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products'
    and ((select auth.jwt()) ->> 'email') = 'muska.homeydeco@gmail.com');

-- ---------------------------------------------------------------------
-- DEUDA CONOCIDA (no la arregla este archivo, esta documentada aca para
-- que quien levante el esquema de cero sepa que hereda)
--
-- 1. products.image y products.image_url conviven. El codigo usa image_url;
--    `image` parece legado. Verificar y borrar una de las dos.
-- 2. No hay politica de UPDATE sobre storage.objects: la admin puede subir y
--    borrar, pero no sobreescribir un archivo existente. Si el panel usa
--    upsert al reemplazar una foto, va a fallar; hoy anda porque borra y
--    vuelve a subir.
-- 3. El chequeo de stock y su descuento NO son atomicos: dos compras
--    simultaneas de la ultima unidad pueden pasar las dos. Se arregla con
--    una funcion en Postgres que haga el update condicional
--    (update products set stock = stock - $1 where id = $2 and stock >= $1).
-- 4. orders.status es text libre, sin check ni enum. Los unicos valores que
--    usa el codigo son 'pending' (al crear el pedido) y 'approved' (cuando
--    el webhook confirma el pago contra la API de MP). No hay estado para
--    pago rechazado ni cancelado: un pedido que no se paga queda 'pending'
--    para siempre y no se distingue de uno recien creado.
-- ---------------------------------------------------------------------
