import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFileBuffer } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const designNotes = formData.get("designNotes") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "File desain wajib diunggah" },
        { status: 400 }
      );
    }

    // Validasi ukuran max 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file melebihi batas maksimal 20MB" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadFileBuffer(fileBuffer, `designs/${orderId}`, file.name, "auto");

    // Update status order ke DESIGN_CHECKING
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        designFileUrl: fileUrl,
        designNotes: designNotes || order.designNotes,
        status: "DESIGN_CHECKING",
        statusHistory: {
          create: {
            status: "DESIGN_CHECKING",
            notes: "File desain berhasil diunggah oleh pelanggan, menunggu validasi.",
            changedBy: session.user.name || "Customer",
          },
        },
      },
    });

    return NextResponse.json({
      message: "File desain berhasil diunggah",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Upload design error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengunggah file desain" },
      { status: 500 }
    );
  }
}
