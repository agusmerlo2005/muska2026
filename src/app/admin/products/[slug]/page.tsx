import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCartButton from '../../../../components/ui/AddToCartButton';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  // CORRECCIÓN: Especificamos 'categories:category_id' aquí también
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (name),
      product_images (url)
    `)
    .eq('slug', params.slug)
    .single();

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-white pt-20 pb-20 px-6">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden rounded-sm">
            <Image 
              src={product.product_images?.[0]?.url || '/placeholder.png'} 
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.product_images?.slice(1).map((img: any, i: number) => (
              <div key={i} className="relative aspect-square bg-gray-50">
                <Image src={img.url} alt={product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Información y Compra */}
        <div className="flex flex-col justify-center max-w-md">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mb-4">
            {product.categories?.name}
          </span>
          <h1 className="text-5xl font-bold tracking-tighter uppercase mb-6 leading-none">
            {product.name}
          </h1>
          <p className="text-2xl font-light mb-8 text-black/80">
            ${product.price.toLocaleString('es-AR')}
          </p>
          
          <div className="prose prose-sm text-gray-500 mb-10 leading-relaxed tracking-wide">
            {product.description || "Pieza artesanal diseñada bajo conceptos de minimalismo industrial."}
          </div>

          <AddToCartButton product={product} />

          <div className="mt-12 pt-8 border-t border-gray-100 space-y-4">
            <details className="group cursor-pointer">
              <summary className="list-none text-[10px] uppercase tracking-widest font-bold flex justify-between">
                Materiales y Cuidados <span>+</span>
              </summary>
              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                Nuestras piezas están fabricadas con materiales nobles. Evitar exposición directa al sol y humedad extrema para conservar su acabado industrial.
              </p>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}