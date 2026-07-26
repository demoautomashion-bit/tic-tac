/**
 * Uploads an image file or Data URL to Vercel Blob via /api/upload.
 * Returns a public web URL hosted on Vercel Blob.
 */
export async function uploadImageToCloud(fileOrDataUrl) {
  if (!fileOrDataUrl) return "";

  try {
    let fileToUpload = fileOrDataUrl;

    if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
      const arr = fileOrDataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      fileToUpload = new Blob([u8arr], { type: mime });
    }

    const formData = new FormData();
    formData.append("image", fileToUpload);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.warn("Image upload error response:", res.status);
      return null;
    }

    const data = await res.json();
    if (data && data.success && data.url) {
      return data.url;
    }

    console.warn("Image upload warning:", data);
    return null;
  } catch (err) {
    console.error("Cloud image upload failed:", err);
    return null;
  }
}
