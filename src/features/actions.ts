import { createClient } from '@/lib/supabase/client';

// Agregamos el parámetro 'limit' con un valor por defecto
export async function getProducts(limit: number = 12) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)') 
    .order('created_at', { ascending: false })
    .limit(limit); // ✅ Ahora respeta el límite que le pasemos

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }

  return data || [];
}