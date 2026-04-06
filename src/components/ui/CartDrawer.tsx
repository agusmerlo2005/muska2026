import { useCart } from '@/hooks/useCart';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const cart = useCart((state) => state.cart);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-[10px] uppercase font-black tracking-[0.4em] text-black">
            Carrito
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={30} className="text-gray-200 mb-2" />
              <p className="text-[10px] uppercase font-bold text-gray-300">
                Vacio
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                
                {/* Imagen */}
                <div className="relative h-24 w-20 bg-gray-100 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover h-full w-full"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  
                  {/* Nombre + precio */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-[10px] uppercase font-black text-black leading-tight max-w-[150px]">
                      {item.name}
                    </h3>

                    <p className="text-[10px] font-bold text-black">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Cantidad + acciones */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-100">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 px-2"
                      >
                        <Minus size={10} />
                      </button>

                      <span className="text-[10px] font-bold w-4 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 px-2"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[9px] uppercase font-bold text-gray-300 hover:text-black"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase font-black text-gray-400">
                Total
              </span>

              <span className="text-2xl font-black text-black">
                ${total.toLocaleString()}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full block text-center bg-black text-white py-5 text-[10px] uppercase font-black tracking-[0.3em]"
            >
              Finalizar Compra
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}