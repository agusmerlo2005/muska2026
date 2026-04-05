'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

export default function ProductForm({ categories }: { categories: any[] }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Seleccioná una imagen");
      return;
    }

    setLoading(true);

    try {
      // 🔥 nombre único REAL (evita bugs)
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

      // 🔥 subir imagen
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 🔥 obtener URL pública
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      if (!publicUrl) {
        throw new Error("No se pudo obtener la URL de la imagen");
      }

      // 🔥 guardar producto
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          name,
          description,
          price: parseFloat(price),
          stock: 0,
          category_id: categoryId,
          image_url: publicUrl,
          active: true,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }]);

      if (insertError) throw insertError;

      alert("Producto creado correctamente 🚀");
      window.location.reload();

    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-white text-black max-w-lg mx-auto">

      <div className="border-2 border-dashed border-gray-200 p-4 text-center relative">

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0];
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {imagePreview ? (
          <img src={imagePreview} className="w-full h-40 object-contain mx-auto" />
        ) : (
          <div className="py-10 text-gray-400">
            <UploadCloud className="mx-auto mb-2" />
            <p className="text-xs uppercase font-black">
              Arrastrá o hacé click para subir
            </p>
          </div>
        )}
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del Producto"
        className="w-full border p-3 rounded"
        required
      />

      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
        placeholder="Precio"
        className="w-full border p-3 rounded"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        className="w-full border p-3 rounded"
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full border p-3 rounded bg-white"
      >
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white p-4 uppercase font-black tracking-widest disabled:bg-gray-400"
      >
        {loading ? 'Guardando...' : 'Crear Producto'}
      </button>
    </form>
  );
}