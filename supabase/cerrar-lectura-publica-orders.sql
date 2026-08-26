-- ---------------------------------------------------------------------
-- CIERRA LA LECTURA PUBLICA DE `orders`
--
-- Problema: la tabla tenia una politica de SELECT para `anon`. Como la anon key
-- viaja en el bundle publico del sitio, cualquiera podia descargar la tabla
-- entera (nombre, mail, telefono, items y total de cada cliente) con un solo
-- request, sin ninguna credencial.
--
-- Verificado el 2026-08-25 contra produccion: el anonimo veia 3 de 3 pedidos y
-- podia seleccionar customer_email, customer_phone, customer_name, items y
-- total_amount.
--
-- /seguimiento ya no depende de esto: pasa por /api/orders/[id], que usa
-- service_role y devuelve solo id, status y customer_name.
-- ---------------------------------------------------------------------

begin;

-- Nombres conocidos de la politica publica. Si en tu proyecto tiene otro
-- nombre, mirá el listado del final y borrala a mano.
drop policy if exists "Lectura pública para seguimiento" on public.orders;
drop policy if exists "Lectura publica para seguimiento" on public.orders;
drop policy if exists "Allow public select"              on public.orders;
drop policy if exists "orders_public_read"               on public.orders;
drop policy if exists "Enable read access for all users" on public.orders;

-- RLS tiene que estar prendido, si no las politicas no se aplican.
alter table public.orders enable row level security;

commit;

-- ---------------------------------------------------------------------
-- COMPROBACION: correr esto despues y revisar el resultado.
-- Solo tiene que quedar la politica de admin (`orders_admin_all`) para el rol
-- `authenticated`. Si aparece alguna fila con `anon` en el campo roles, esa es
-- la que falta borrar.
-- ---------------------------------------------------------------------
select policyname, roles, cmd
from pg_policies
where schemaname = 'public' and tablename = 'orders'
order by policyname;
