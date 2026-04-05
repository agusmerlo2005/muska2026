import { z } from 'zod';

// Esquema de Categorías
export const categorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug inválido (solo minúsculas y guiones)")
});

// Esquema de Productos
export const productSchema = z.object({
  name: z.string().min(3, "Nombre obligatorio"),
  description: z.string().optional().default(""),
  price: z.coerce.number().positive("El precio debe ser un número positivo"),
  stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo"),
  category_id: z.string().uuid("Categoría inválida"),
  active: z.boolean().default(true).optional(),
  slug: z.string().min(3, "El slug es obligatorio")
});

export type ProductOutput = z.infer<typeof productSchema>;
export type CategoryOutput = z.infer<typeof categorySchema>;