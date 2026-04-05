'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { categorySchema, productSchema } from './schemas';

/**
 * ACCIÓN: Crear Categoría
 */
export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  
  const rawData = {
    name: formData.get('name'),
    slug: formData.get('slug'),
  };

  const validated = categorySchema.parse(rawData);
  const { error } = await supabase.from('categories').insert(validated);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
}

/**
 * ACCIÓN: Crear Producto (La que te estaba faltando exportar)
 */
export async function createProduct(data: any, imageUrls: string[]) {
  const supabase = await createClient();
  
  // 1. Validamos los datos con el esquema de Zod
  const validated = productSchema.parse(data);

  // 2. Insertamos el producto en la tabla 'products'
  const { data: product, error: pError } = await supabase
    .from('products')
    .insert(validated)
    .select()
    .single();

  if (pError) throw new Error(pError.message);

  // 3. Si hay imágenes, las vinculamos en la tabla 'product_images'
  if (imageUrls && imageUrls.length > 0) {
    const imagesData = imageUrls.map((url, index) => ({
      product_id: product.id,
      url: url,
      order_index: index
    }));

    const { error: iError } = await supabase
      .from('product_images')
      .insert(imagesData);

    if (iError) {
      console.error("Error vinculando imágenes:", iError.message);
    }
  }

  // 4. Limpiamos la caché de Next.js para que los cambios se vean al instante
  revalidatePath('/admin/products');
  revalidatePath('/');
  
  return product;
}