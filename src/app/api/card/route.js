import { NextResponse } from "next/server";

// Using persistent public JSON storage API (JSONBin) for global cross-device access
const BIN_ENDPOINT = "https://api.jsonbin.io/v3/b";
const MASTER_KEY = "$2a$10$vYjCkWvA4N94Pvgw/.mBteS09sI72yB9z6p.lXqJ91E7l.eL.N77e";

export async function POST(request) {
  try {
    const body = await request.json();
    const { flow, theme } = body;

    if (!flow || !Array.isArray(flow)) {
      return NextResponse.json({ error: "Invalid flow payload" }, { status: 400 });
    }

    const res = await fetch(BIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY,
        "X-Bin-Private": "false",
      },
      body: JSON.stringify({ flow, theme, createdAt: new Date().toISOString() }),
    });

    const data = await res.json();
    if (data && data.metadata && data.metadata.id) {
      return NextResponse.json({ id: data.metadata.id, success: true });
    }

    return NextResponse.json({ error: "Failed to persist card" }, { status: 500 });
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

    const res = await fetch(`${BIN_ENDPOINT}/${encodeURIComponent(id)}/latest`, {
      method: "GET",
      headers: {
        "X-Master-Key": MASTER_KEY,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Card payload not found" }, { status: 404 });
    }

    const data = await res.json();
    if (data && data.record) {
      return NextResponse.json({ record: data.record, success: true });
    }

    return NextResponse.json({ error: "Invalid card data structure" }, { status: 404 });
  } catch (error) {
    console.error("API GET card error:", error);
    return NextResponse.json({ error: "Failed to retrieve card payload" }, { status: 500 });
  }
}
