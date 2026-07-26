import { NextResponse } from "next/server";

// Public key-value bin storage with fallback endpoint
const PRIMARY_BIN_ENDPOINT = "https://api.jsonbin.io/v3/b";
const MASTER_KEY = "$2a$10$vYjCkWvA4N94Pvgw/.mBteS09sI72yB9z6p.lXqJ91E7l.eL.N77e";

// Serverless memory backup cache
const memoryStore = new Map();

function generateShortId(length = 7) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { flow, theme } = body;

    if (!flow || !Array.isArray(flow)) {
      return NextResponse.json({ error: "Invalid flow payload" }, { status: 400 });
    }

    // Try primary external KV storage first
    try {
      const res = await fetch(PRIMARY_BIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": MASTER_KEY,
          "X-Bin-Private": "false",
        },
        body: JSON.stringify({ flow, theme, createdAt: new Date().toISOString() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.metadata && data.metadata.id) {
          return NextResponse.json({ id: data.metadata.id, success: true });
        }
      }
    } catch (e) {
      console.warn("External cloud storage unavailable, using serverless cache:", e);
    }

    // Fallback to internal serverless short ID store
    const shortId = generateShortId();
    memoryStore.set(shortId, { flow, theme, createdAt: new Date().toISOString() });
    return NextResponse.json({ id: shortId, success: true });

  } catch (error) {
    console.error("API POST card error:", error);
    return NextResponse.json({ error: "Failed to save card payload" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing card ID" }, { status: 400 });
    }

    // Check internal memory store first
    if (memoryStore.has(id)) {
      return NextResponse.json({ record: memoryStore.get(id), success: true });
    }

    // Otherwise fetch from cloud endpoint
    try {
      const res = await fetch(`${PRIMARY_BIN_ENDPOINT}/${encodeURIComponent(id)}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": MASTER_KEY,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.record) {
          return NextResponse.json({ record: data.record, success: true });
        }
      }
    } catch (e) {
      console.warn("External cloud fetch failed:", e);
    }

    return NextResponse.json({ error: "Card payload not found" }, { status: 404 });
  } catch (error) {
    console.error("API GET card error:", error);
    return NextResponse.json({ error: "Failed to retrieve card payload" }, { status: 500 });
  }
}
