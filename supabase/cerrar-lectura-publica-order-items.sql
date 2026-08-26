-- ---------------------------------------------------------------------
-- CIERRA LA LECTURA PUBLICA DE `order_items`
--
-- Encontrado el 2026-08-25 auditando el resto de las tablas. Es el MISMO
-- agujero que se cerro en `orders`, pero en la tabla hermana: el script
-- `cerrar-lectura-publica-orders.sql` solo toco `public.orders` y dejo viva
-- la politica gemela en `public.order_items`.
--
--   politica : "Lectura pública para seguimiento items"
--   rol      : anon
--   cmd      : SELECT
--   using    : true          <- sin filtro, la tabla entera
--
-- ALCANCE REAL HOY: ninguno. La tabla esta VACIA (0 filas, verificado como
-- admin, asi que el 0 es real y no la ambiguedad de RLS de la vez pasada) y
-- el codigo no la usa: los items del pedido se guardan como JSON en
-- `orders.items`. O sea que no se filtro nada.
--
-- POR QUE CERRARLA IGUAL: es una mina enterrada. El dia que alguien
-- normalice los items y empiece a escribir en esta tabla, queda publica sin
-- que nadie toque una politica. Expondria, por cada pedido, que productos se
-- vendieron, en que cantidad y a que precio.
-- ---------------------------------------------------------------------

begin;

drop policy if exists "Lectura pública para seguimiento items" on public.order_items;
-- Variantes por si el nombre difiere (acentos, etc).
drop policy if exists "Lectura publica para seguimiento items" on public.order_items;
drop policy if exists "order_items_public_read"                on public.order_items;

alter table public.order_items enable row level security;

commit;


-- ---------------------------------------------------------------------
-- COMPROBACION · no tiene que devolver ninguna fila.
-- ---------------------------------------------------------------------
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and roles::text[] && array['anon', 'public']
  and tablename in ('orders', 'order_items');


-- ---------------------------------------------------------------------
-- Y este es el estado esperado del resto: SELECT anon solo sobre el
-- catalogo (categories, product_images, shipping_rates y products activos).
-- Cualquier otra fila que aparezca aca hay que mirarla.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public' and roles::text[] && array['anon', 'public']
order by tablename;
