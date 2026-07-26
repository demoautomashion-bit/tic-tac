/**
 * Uploads an image file or Data URL to free ImgBB image hosting API.
 * Returns a short, public web URL (e.g. https://i.ibb.co/... ~35 chars).
 */
export async function uploadImageToCloud(fileOrDataUrl) {
  if (!fileOrDataUrl) return "";

  try {
    let fileToUpload = fileOrDataUrl;

    // If it's a data URL, convert it to a Blob File for form upload
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

    // Free ImgBB API key for client-side uploads
    const API_KEY = "6d257f2c1d0138402b81ea117d9298c8";
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data && data.success && data.data && data.data.url) {
      return data.data.url;
    } else {
      console.warn("ImgBB upload error response:", data);
      return null;
    }
  } catch (err) {
    console.error("Cloud image upload failed:", err);
    return null;
  }
}
