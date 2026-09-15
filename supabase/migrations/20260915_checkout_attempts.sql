-- ---------------------------------------------------------------------
-- LIMITE DE INTENTOS EN /api/checkout
--
-- /api/checkout es publico y cada llamada crea un pedido y manda un mail.
-- Sin limite, un script puede llenar `orders` de pedidos basura y agotar la
-- cuota diaria de Resend (con lo que dejan de salir los mails de verdad).
--
-- Esta tabla registra cada intento por IP (hasheada, no la IP en claro) y el
-- endpoint corta con 429 si una misma IP pasa el limite. Las filas de mas de
-- un dia las borra el propio endpoint.
--
-- Solo la usa el servidor con service_role: RLS activado y SIN politicas, asi
-- que anon y authenticated no pueden ni leerla ni escribirla.
--
-- Si esta tabla no existe el checkout sigue funcionando (el limite falla
-- abierto), asi que el orden deploy / script no importa.
-- ---------------------------------------------------------------------

begin;

create table if not exists public.checkout_attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);

create index if not exists checkout_attempts_ip_hash_created_at_idx
  on public.checkout_attempts (ip_hash, created_at);

create index if not exists checkout_attempts_created_at_idx
  on public.checkout_attempts (created_at);

alter table public.checkout_attempts enable row level security;

revoke all on public.checkout_attempts from anon, authenticated;

commit;
