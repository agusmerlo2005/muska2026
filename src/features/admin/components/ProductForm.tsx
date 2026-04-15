'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import imageCompression from 'browser-image-compression'; // ✅ ESCUDO RENDIMIENTO

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

  const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    price: productToEdit?.price || '',
    category_id: productToEdit?.category_id || '',
    subcategory_id: productToEdit?.subcategory_id || '',
    description: productToEdit?.description || '',
    stock: productToEdit?.stock ?? 0,
    is_featured: productToEdit?.is_featured ?? false,
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        price: productToEdit.price || '',
        category_id: productToEdit.category_id || '',
        subcategory_id: productToEdit.subcategory_id || '',
        description: productToEdit.description || '',
        stock: productToEdit.stock ?? 0,
        is_featured: productToEdit.is_featured ?? false,
      });
      setPreview(productToEdit.image_url || null);
      
      const subs = categories.filter(c => c.parent_id === productToEdit.category_id);
      setFilteredSubcategories(subs);
    }
  }, [productToEdit, categories]);

  const handleCategoryChange = (catId: string) => {
    setFormData({ ...formData, category_id: catId, subcategory_id: '' });
    const subs = categories.filter(c => c.parent_id === catId);
    setFilteredSubcategories(subs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_url = productToEdit?.image_url;

      if (image) {
        // ✅ COMPRESIÓN DE IMAGEN (Max 800kb para no perder calidad visual de Muska)
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        
        const compressedFile = await imageCompression(image, options);
        
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, compressedFile); // Subimos el archivo comprimido

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('products').getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      const payload = {
        name: formData.name.toUpperCase(),
        price: parseFloat(formData.price.toString()),
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || null,
        description: formData.description,
        stock: parseInt(formData.stock.toString()) || 0,
        is_featured: formData.is_featured,
        image_url,
      };

      if (productToEdit) {
        // ✅ ESCUDO SEGURIDAD: La política RLS de Supabase validará que seas Admin
        const { error } = await supabase.from('products').update(payload).eq('id', productToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        setFormData({ name: '', price: '', category_id: '', subcategory_id: '', description: '', stock: 0, is_featured: false });
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

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-1">
            <label className={labelClasses}>Categoría Principal</label>
            <select 
              className={`${inputClasses} appearance-none bg-white`} 
              required 
              value={formData.category_id} 
              onChange={e => handleCategoryChange(e.target.value)}
            >
              <option value="" disabled>SELECCIONAR...</option>
              {categories.filter(c => !c.parent_id).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>Subcategoría</label>
            <select 
              className={`${inputClasses} appearance-none bg-white ${filteredSubcategories.length === 0 ? 'opacity-30' : ''}`} 
              value={formData.subcategory_id} 
              onChange={e => setFormData({...formData, subcategory_id: e.target.value})}
              disabled={filteredSubcategories.length === 0}
            >
              <option value="">NINGUNA</option>
              {filteredSubcategories.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-1">
          <label className={labelClasses}>Descripción Breve</label>
          <textarea rows={3} className={`${inputClasses} resize-none`} placeholder="DETALLES O CARACTERÍSTICAS..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
          <input 
            type="checkbox" 
            id="is_featured"
            className="w-5 h-5 accent-black cursor-pointer"
            checked={formData.is_featured} 
            onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
          />
          <label htmlFor="is_featured" className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">
            Mostrar en "Destacados" de la página principal
          </label>
        </div>
      </div>

      <button disabled={loading} className="w-full bg-black text-white py-6 text-xs font-black uppercase tracking-[0.4em] hover:bg-gray-900 transition-all disabled:bg-gray-100 disabled:text-gray-300 active:scale-[0.98]">
        {loading ? 'PROCESANDO...' : productToEdit ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
      </button>
    </form>
  );
}