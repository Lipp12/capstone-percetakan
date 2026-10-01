import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const orderFormSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  materialId: z.string().optional(),
  width: z.number().positive("Lebar harus lebih dari 0").optional(),
  height: z.number().positive("Tinggi harus lebih dari 0").optional(),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  pickupMethod: z.enum(["PICKUP", "DELIVERY"]),
  address: z.string().optional(),
  finishingIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.pickupMethod === "DELIVERY" && (!data.address || data.address.trim().length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Alamat pengiriman wajib diisi jika memilih metode Delivery",
    path: ["address"],
  }
);

export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  category: z.string().min(2, "Kategori wajib diisi"),
  basePrice: z.number().positive("Harga dasar harus lebih dari 0"),
  unit: z.enum(["m2", "pcs"]),
  imageUrl: z.string().optional().nullable(),
});

export const materialSchema = z.object({
  name: z.string().min(3, "Nama material minimal 3 karakter"),
  description: z.string().optional(),
  pricePerUnit: z.number().positive("Harga per unit harus lebih dari 0"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  minStock: z.number().min(0, "Minimal stok tidak boleh negatif"),
});

export const finishingSchema = z.object({
  name: z.string().min(3, "Nama finishing minimal 3 karakter"),
  price: z.number().positive("Harga harus lebih dari 0"),
  unit: z.string().min(1, "Satuan wajib diisi"),
});
