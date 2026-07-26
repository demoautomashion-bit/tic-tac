/**
 * Storage handler for card payloads.
 * Uses a free public JSON Bin API service (JSONBin / kv store) to save card payloads
 * and return short 6-8 character IDs for ultra-clean shareable links.
 */

// Free public JSON storage endpoint (using JSONBin.io public structure or fallback bin service)
const BIN_ENDPOINT = "https://api.jsonbin.io/v3/b";
const MASTER_KEY = "$2a$10$vYjCkWvA4N94Pvgw/.mBteS09sI72yB9z6p.lXqJ91E7l.eL.N77e"; // Public read/write key for client app

/**
 * Saves a card payload to cloud JSON storage and returns a short ID.
 */
export async function saveCardPayloadToCloud(flow, theme) {
  const payload = { flow, theme, createdAt: new Date().toISOString() };

  try {
    const res = await fetch(BIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY,
        "X-Bin-Private": "false",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data && data.metadata && data.metadata.id) {
      return data.metadata.id; // Returns short bin ID e.g. "667a1b4e..."
    } else {
      console.warn("Cloud save warning, falling back to local encoding:", data);
      return null;
    }
  } catch (err) {
    console.error("Cloud card save error:", err);
    return null;
  }
}

/**
 * Fetches a card payload from cloud storage by bin ID.
 */
export async function fetchCardPayloadFromCloud(binId) {
  if (!binId) return null;

  try {
    const res = await fetch(`${BIN_ENDPOINT}/${binId}/latest`, {
      method: "GET",
      headers: {
        "X-Master-Key": MASTER_KEY,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.record) {
      return data.record; // Returns { flow, theme }
    }
    return null;
  } catch (err) {
    console.error("Error fetching card payload:", err);
    return null;
  }
}
