// Guarda los IDs de pedido en el navegador del cliente (localStorage) para que
// pueda volver a encontrarlos aunque cierre la página o no le llegue el mail.
// Solo persiste en el mismo dispositivo/navegador.

export type RecentOrder = { id: string; date: string };

const KEY = 'muska_recent_orders';
const MAX = 10;

export function saveRecentOrder(id: string) {
  if (!id || typeof window === 'undefined') return;
  try {
    const list = getRecentOrders().filter((o) => o.id !== id);
    list.unshift({ id, date: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Si el navegador bloquea localStorage (modo incógnito estricto), no hacemos nada.
  }
}

export function getRecentOrders(): RecentOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
