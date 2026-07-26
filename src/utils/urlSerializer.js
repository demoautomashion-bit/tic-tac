import LZString from "lz-string";

/**
 * Downscales and compresses an image Data URL using HTML5 Canvas
 */
export function compressImageDataUrl(dataUrl, maxDim = 400, quality = 0.65) {
  return new Promise((resolve) => {
    if (!dataUrl || typeof window === "undefined") {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

/**
 * Compresses flow config & theme into a high-ratio URL-safe string
 */
export function encodeCardPayload(flow, theme) {
  try {
    const payload = { flow, theme };
    const jsonStr = JSON.stringify(payload);
    // Use LZ-String encoded URI component for maximum compression ratio
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (e) {
    console.error("Encoding error:", e);
    return "";
  }
}

/**
 * Decodes card payload string from URL param (supports LZ-String and legacy Base64)
 */
export function decodeCardPayload(str) {
  if (!str) return null;

  // 1. Try LZ-String decompression first
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(str);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      if (Array.isArray(parsed)) return { flow: parsed, theme: null };
      if (parsed && parsed.flow) return parsed;
    }
  } catch (e) {
    // Continue to legacy fallback
  }

  // 2. Legacy Base64 fallback for older generated links
  try {
    const decoded = decodeURIComponent(escape(atob(str)));
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) return { flow: parsed, theme: null };
    if (parsed && parsed.flow) return parsed;
  } catch (e) {
    console.error("Decoding error:", e);
  }

  return null;
}
