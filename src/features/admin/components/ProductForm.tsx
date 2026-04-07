'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react'; // Agregamos useEffect para sincronizar
import { Upload, X } from 'lucide-react';

interface ProductFormProps {
  categories: any[];
  productToEdit?: any;
  onSuccess?: () => void;
}

export default function ProductForm({ categories, productToEdit, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(productToEdit?.image_url || null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    price: productToEdit?.price || '',
    category_id: productToEdit?.category_id || '',
    description: productToEdit?.description || '',
    stock: productToEdit?.stock ?? 0, // Usamos ?? para que si es 0 no lo tome como vacío
  });

  // Este efecto asegura que si hacés clic en "Editar" en otro producto, 
  // los datos del formulario se actualicen de verdad.
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        price: productToEdit.price || '',
        category_id: productToEdit.category_id || '',
        description: productToEdit.description || '',
        stock: productToEdit.stock ?? 0,
      });
      setPreview(productToEdit.image_url || null);
    }
  }, [productToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_url = productToEdit?.image_url;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      const payload = {
        name: formData.name.toUpperCase(),
        price: parseFloat(formData.price.toString()),
        category_id: formData.category_id,
        description: formData.description,
        stock: parseInt(formData.stock.toString()) || 0, // Aseguramos que sea número
        image_url,
      };

      if (productToEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', productToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        setFormData({ name: '', price: '', category_id: '', description: '', stock: 0 });
        setPreview(null);
      }

      if (onSuccess) onSuccess();
      alert(productToEdit ? "CAMBIOS GUARDADOS" : "PRODUCTO CREADO");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full border-b border-gray-100 py-3.5 text-base font-medium uppercase outline-none focus:border-black bg-transparent transition-colors placeholder:text-gray-200";
  const labelClasses = "text-[10px] font-black text-gray-400 uppercase tracking-widest block";

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="relative aspect-video bg-gray-50 border border-dashed border-gray-100 flex items-center justify-center overflow-hidden rounded-sm group">
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
            <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 bg-white/90 p-2.5 rounded-full shadow-sm"><X size={16} className="text-black"/></button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center p-6 text-center">
            <Upload className="text-gray-300 mb-3" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seleccionar Imagen</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
            }} />
          </label>
        )}
      </div>

      <div className="space-y-8">
        <div className="space-y-1">
          <label className={labelClasses}>Nombre del Artículo</label>
          <input className={inputClasses} placeholder="EJ: VELA VAINILLA GRAND" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className={labelClasses}>Precio ($)</label>
            <input type="number" className={inputClasses} placeholder="EJ: 12500" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>Stock</label>
            <input 
              type="number" 
              className={inputClasses} 
              placeholder="EJ: 10" 
              required 
              value={formData.stock} 
              onChange={e => setFormData({...formData, stock: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>Categoría</label>
          <select className={`${inputClasses} appearance-none bg-white`} required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
            <option value="" disabled className="text-gray-200">SELECCIONAR...</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        
        <div className="space-y-1">
          <label className={labelClasses}>Descripción Breve</label>
          <textarea rows={3} className={`${inputClasses} resize-none`} placeholder="DETALLES O CARACTERÍSTICAS..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
      </div>

      <button disabled={loading} className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-gray-900 transition-all disabled:bg-gray-100 disabled:text-gray-300 active:scale-[0.98]">
        {loading ? 'PROCESANDO...' : productToEdit ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
      </button>
    </form>
  );
}