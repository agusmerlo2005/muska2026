'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales inválidas. Revisá el mail o la contraseña.');
      setLoading(false);
    } else {
      // Si todo sale bien, el middleware ahora la dejará pasar
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[350px]"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">MUSKA</h1>
          <p className="text-[8px] tracking-[0.5em] uppercase text-gray-400 font-bold">
            Acceso Privado / Est. 2026
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="muska.homeydeco@gmail.com"
              className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors placeholder:text-gray-200"
              required
            />
          </div>

          <div>
            <label className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-[9px] uppercase font-bold text-red-500 tracking-wider animate-pulse">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 text-[10px] uppercase font-black tracking-[0.3em] hover:bg-gray-900 transition-all disabled:bg-gray-200"
          >
            {loading ? 'Verificando...' : 'Entrar al Panel'}
          </button>
        </form>

        <div className="mt-12 flex justify-center">
          <Lock size={14} className="text-gray-100" />
        </div>
      </motion.div>
    </div>
  );
}