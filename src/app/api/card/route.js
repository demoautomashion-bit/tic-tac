import { NextResponse } from "next/server";
import { put, head } from "@vercel/blob";

const CARD_PREFIX = "cards/";

function generateShortId(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function isValidCardId(id) {
  return Boolean(id && id.length <= 20 && /^[a-zA-Z0-9]+$/.test(id));
}

function cardPathname(id) {
  return `${CARD_PREFIX}${id}.json`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { flow, theme } = body;

    if (!flow || !Array.isArray(flow)) {
      return NextResponse.json({ error: "Invalid flow payload" }, { status: 400 });
    }

    const id = generateShortId();
    const pathname = cardPathname(id);
    const record = { flow, theme, createdAt: new Date().toISOString() };

    await put(pathname, JSON.stringify(record), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return NextResponse.json({ id, success: true });
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

    if (!isValidCardId(id)) {
      return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
    }

    const pathname = cardPathname(id);
    const blobInfo = await head(pathname);
    const res = await fetch(blobInfo.url);

    if (!res.ok) {
      return NextResponse.json({ error: "Card payload not found" }, { status: 404 });
    }

    const record = await res.json();
    if (!record || !Array.isArray(record.flow)) {
      return NextResponse.json({ error: "Card payload not found" }, { status: 404 });
    }

    return NextResponse.json({ record, success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("does not exist")) {
      return NextResponse.json({ error: "Card payload not found" }, { status: 404 });
    }

    console.error("API GET card error:", error);
    return NextResponse.json({ error: "Failed to retrieve card payload" }, { status: 500 });
  }
}
