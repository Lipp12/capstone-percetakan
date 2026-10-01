import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFileBuffer } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN" && role !== "OPERATOR") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validasi tipe file gambar
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Format file harus berupa gambar (JPG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    // Maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran gambar maksimal 5MB" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFileBuffer(fileBuffer, "products", file.name, "image");

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah gambar" },
      { status: 500 }
    );
  }
}
