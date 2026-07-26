import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const IMAGE_PREFIX = "images/";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function generateImageId(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function extFromMime(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const mime = file.type || "image/jpeg";
    if (!mime.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image too large (max 5 MB)" }, { status: 400 });
    }

    const id = generateImageId();
    const pathname = `${IMAGE_PREFIX}${id}.${extFromMime(mime)}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: mime,
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url, success: true });
  } catch (error) {
    console.error("API POST upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
