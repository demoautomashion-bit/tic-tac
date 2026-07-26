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
 * High-compression Delta Encoder:
 * Compresses only customized fields (stripping default unchanged text & structure)
 * using short-key maps before LZ-String compression.
 */
export function encodeCardPayload(flow, theme, defaultFlow = []) {
  try {
    if (!flow || !Array.isArray(flow)) return "";

    // Minify flow by keeping only properties that differ from defaults
    const minifiedFlow = flow.map((step, idx) => {
      const defaultStep = defaultFlow[idx] || {};
      const minStep = { i: step.id, t: step.type };

      for (const [key, val] of Object.entries(step)) {
        if (key === "id" || key === "type") continue;

        let sanitizedVal = val;

        // Sanitize polaroids array: strip base64 data URLs if cloud upload failed
        if (key === "polaroids" && Array.isArray(val)) {
          sanitizedVal = val.map(p => ({
            ...p,
            url: (p.url && p.url.startsWith("data:")) ? "" : p.url
          }));
        }

        // Sanitize single image URL string: strip base64 data URLs
        if (key === "imageUrl" && typeof val === "string" && val.startsWith("data:")) {
          sanitizedVal = "";
        }

        // Skip null, undefined, or empty values matching defaults
        if (JSON.stringify(sanitizedVal) !== JSON.stringify(defaultStep[key])) {
          minStep[key] = sanitizedVal;
        }
      }
      return minStep;
    });

    const payload = { f: minifiedFlow, th: theme };
    const jsonStr = JSON.stringify(payload);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (e) {
    console.error("Encoding error:", e);
    return "";
  }
}

/** Returns true when a URL param looks like a short cloud ID, not a legacy encoded payload. */
export function isCloudShareId(param) {
  return Boolean(param && param.length <= 40 && /^[a-zA-Z0-9_-]+$/.test(param));
}

/**
 * Decodes card payload string from URL param (supports Delta format, legacy LZ-String and Base64)
 */
export function decodeCardPayload(str, defaultFlow = []) {
  if (!str) return null;

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(str);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);

      // Handle Delta Minified Format ({ f, th })
      if (parsed && parsed.f && Array.isArray(parsed.f)) {
        const restoredFlow = parsed.f.map((minStep, idx) => {
          const defaultStep = defaultFlow[idx] || {};
          const fullStep = { ...defaultStep, id: minStep.i || defaultStep.id, type: minStep.t || defaultStep.type };

          for (const [key, val] of Object.entries(minStep)) {
            if (key === "i" || key === "t") continue;
            fullStep[key] = val;
          }
          return fullStep;
        });

        return { flow: restoredFlow, theme: parsed.th || 'burgundy' };
      }

      if (Array.isArray(parsed)) return { flow: parsed, theme: null };
      if (parsed && parsed.flow) return parsed;
    }
  } catch (e) {
    // Fall back to legacy base64 decoding
  }

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
