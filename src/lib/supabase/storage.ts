import { createClient } from './client'; // Asegúrate de tener el client.ts (browser)

export async function uploadProductImage(file: File) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (error) throw error;

  // Retornamos la URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(data.path);

  return publicUrl;
}