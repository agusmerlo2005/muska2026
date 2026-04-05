import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Creamos el cliente para el navegador
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}