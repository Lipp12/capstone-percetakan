import { NextRequest, NextResponse } from "next/server";
import { buildMessages, isOutOfScope, OUT_OF_SCOPE_REPLY, type ChatMessage, type Role } from "@/lib/ai";

// Pastikan route ini dinamis dan tidak di-cache oleh Next.js
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages?: ChatMessage[];
  role?: Role;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    code?: number | string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parsing dan validasi request body dari client secara aman
    let body: ChatRequestBody | null = null;
    try {
      body = (await req.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json(
        { error: "Format request body tidak valid (harus JSON)." },
        { status: 400 }
      );
    }

    const { messages, role } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Format request tidak valid: 'messages' harus berupa array." },
        { status: 400 }
      );
    }

    // 2. Guard topik: tolak permintaan yang jelas di luar percetakan sebelum
    //    memanggil model. Menghemat token dan menjamin penolakan tetap berlaku
    //    walau model kecil mengabaikan system prompt.
    if (isOutOfScope(messages)) {
      return NextResponse.json({ reply: OUT_OF_SCOPE_REPLY });
    }

    // 3. Validasi API Key di environment server (aman, tidak bocor ke client)
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      console.error("[Chat Route Error]: AI_API_KEY belum diset di .env.local");
      return NextResponse.json(
        { error: "AI_API_KEY belum diset di .env.local" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.AI_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

    // 4. Sisipkan system prompt sesuai role (customer atau admin)
    const validatedRole: Role = role === "admin" ? "admin" : "customer";
    const finalMessages = buildMessages(validatedRole, messages);

    // 4. Panggil OpenRouter API menggunakan fetch bawaan
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Capstone Percetakan",
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        temperature: 0.7,
      }),
    });

    // 5. Tangani error dari OpenRouter (detail di-log di server, pesan aman ke client)
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[OpenRouter API Error ${res.status}]:`, errText);

      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      return NextResponse.json({ reply: localReply(lastUser) });
    }

    const data = (await res.json()) as OpenRouterResponse;
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Maaf, aku belum bisa menjawab pertanyaan tersebut saat ini.";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[Chat Route Server Error]:", errorMessage);
    return NextResponse.json({ reply: localReply("") });
  }
}

function localReply(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("bahan") || q.includes("kertas")) {
    return "Untuk percetakan, pilihan bahan umum: Art Paper (poster/brosur), Art Carton (kemasan), HVS (dokumen), Vinyl (stiker outdoor). Rekomendasi spesifik tergantung penggunaan indoor/outdoor dan ketahanan air. Silakan cek kalkulator harga untuk estimasi.";
  }
  if (q.includes("harga") || q.includes("estimasi") || q.includes("biaya")) {
    return "Estimasi harga tergantung produk, ukuran, bahan, dan finishing. Gunakan kalkulator harga di halaman produk atau hubungi Admin CS untuk penawaran pasti.";
  }
  if (q.includes("stiker") || q.includes("sticker")) {
    return "Stiker tersedia dalam berbagai bahan (vinyl, chrome, transparan). Proses cetak biasanya 1-3 hari kerja setelah desain disetujui. Ukuran dan jumlah memengaruhi harga.";
  }
  if (q.includes("banner") || q.includes("spanduk")) {
    return "Banner/spanduk umumnya cetak flexi (indoor/outdoor) dengan finishing mata ayam/lipat. Waktu pengerjaan 1-2 hari kerja. Ukuran custom bisa dihitung di kalkulator.";
  }
  if (q.includes("kartu nama")) {
    return "Kartu nama biasanya cetak 1 sisi/2 sisi pada Art Paper/Carton dengan laminasi. Minimal order 1 box (100 lembar), pengerjaan 1-2 hari kerja.";
  }
  if (q.includes("poster")) {
    return "Poster dicetak pada Art Paper dengan berbagai ukuran (A3, A2, A1, dll). Bisa ditambah laminasi. Estimasi 1-2 hari kerja.";
  }
  if (q.includes("status") || q.includes("pesanan") || q.includes("tracking")) {
    return "Cek status pesanan di halaman 'Riwayat Pesanan' atau tracking pesanan. Untuk detail lebih lanjut, hubungi Admin CS.";
  }
  if (q.includes("file") || q.includes("desain") || q.includes("revisi")) {
    return "File desain sebaiknya PDF/CMYK resolusi tinggi. Revisi desain bisa diajukan melalui chat CS dengan menyertakan nomor pesanan.";
  }
  return "Maaf, layanan AI sedang sibuk. Saya bisa bantu topik percetakan umum (bahan, harga, stiker, banner, kartu nama, poster, status pesanan, file desain). Silakan tanyakan salah satu, atau gunakan Live Chat Admin untuk bantuan langsung.";
}
