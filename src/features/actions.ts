import { createClient } from '@/lib/supabase/client';

export async function getProducts() {
  const supabase = createClient();
  
  // El '*' es clave para que traiga la columna 'image_url' que creamos
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)') 
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }

  return data || [];
}