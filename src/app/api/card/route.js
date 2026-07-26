import { NextResponse } from "next/server";

// Simple in-memory / persistent store for card payloads
const cardStore = new Map();

// Helper to generate a short random alphanumeric ID (e.g. "k8F2mP9x")
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

    const shortId = generateShortId();
    cardStore.set(shortId, { flow, theme, createdAt: new Date().toISOString() });

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

    const cardData = cardStore.get(id);
    if (!cardData) {
      return NextResponse.json({ error: "Card payload not found" }, { status: 404 });
    }

    return NextResponse.json({ record: cardData, success: true });
  } catch (error) {
    console.error("API GET card error:", error);
    return NextResponse.json({ error: "Failed to retrieve card payload" }, { status: 500 });
  }
}
