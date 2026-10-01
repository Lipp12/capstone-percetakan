import { NextRequest, NextResponse } from "next/server";
import { buildMessages, type ChatMessage, type Role } from "@/lib/ai";

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

    // 2. Validasi API Key di environment server (aman, tidak bocor ke client)
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

    // 3. Sisipkan system prompt sesuai role (customer atau admin)
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

      return NextResponse.json(
        { error: "Gagal memanggil AI. Silakan coba beberapa saat lagi." },
        { status: res.status }
      );
    }

    const data = (await res.json()) as OpenRouterResponse;
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Maaf, aku belum bisa menjawab pertanyaan tersebut saat ini.";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    // 6. Tangani error tak terduga (misal jaringan / internal server)
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[Chat Route Server Error]:", errorMessage);

    return NextResponse.json(
      { error: "Terjadi kesalahan di server", detail: errorMessage },
      { status: 500 }
    );
  }
}
