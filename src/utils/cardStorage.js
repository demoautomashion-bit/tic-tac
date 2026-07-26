/**
 * Storage handler for card payloads.
 * Uses native same-origin Next.js API endpoint (/api/card)
 * returning short 7-character IDs guaranteed across all mobile devices.
 */

/**
 * Saves a card payload to native API endpoint and returns a short ID.
 */
export async function saveCardPayloadToCloud(flow, theme) {
  const payload = { flow, theme };

  try {
    const res = await fetch("/api/card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("API error response:", res.status);
      return null;
    }

    const data = await res.json();
    if (data && data.success && data.id) {
      return data.id; // Returns short ID e.g. "k8F2mP9x"
    } else {
      console.warn("Card save warning:", data);
      return null;
    }
  } catch (err) {
    console.error("Card payload save error:", err);
    return null;
  }
}

/**
 * Fetches a card payload from native API endpoint by short ID.
 */
export async function fetchCardPayloadFromCloud(binId) {
  if (!binId) return null;

  try {
    const res = await fetch(`/api/card?id=${encodeURIComponent(binId)}`, {
      method: "GET",
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
