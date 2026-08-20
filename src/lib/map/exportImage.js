// Flattens the map's layer canvases into a single PNG. Three consumers:
// exportMapImage downloads the file (Shift+Alt+E in Map.svelte), storeMapImage
// writes it to object storage and returns the storage key, and uploadMapImage
// builds a share URL from that key (reached through shareMapImage in
// mapActions.js, which is what ExportShareButton calls).

const SIGN_ENDPOINT = "/.netlify/functions/sign-image-upload";

// Ceiling on the rendercomplete wait in storeMapImage, so a stalled tile
// surfaces as an error the caller can show instead of a promise that never
// settles.
const RENDER_TIMEOUT_MS = 20000;

// Waits for the next completed render, then composites every canvas inside
// #map-div onto one canvas, preserving each layer's opacity and transform.
export function composeMapCanvas(map) {
  return new Promise((resolve, reject) => {
    if (!map) {
      reject(new Error("There's no map to export."));
      return;
    }

    map.once("rendercomplete", function () {
      const size = map.getSize();
      if (!size) {
        reject(new Error("The map has no size to export."));
        return;
      }

      const exportCanvas = document.createElement("canvas");
      const [width, height] = size;
      exportCanvas.width = width;
      exportCanvas.height = height;
      const context = exportCanvas.getContext("2d");
      if (!context) {
        reject(new Error("Couldn't get a drawing context for the export."));
        return;
      }

      const canvases = document.querySelectorAll("#map-div canvas");

      canvases.forEach((canvas) => {
        if (!(canvas instanceof HTMLCanvasElement)) return;
        if (canvas.width === 0 || canvas.height === 0) return;

        const opacity =
          (canvas.parentElement && canvas.parentElement.style.opacity) || "";
        context.globalAlpha = opacity === "" ? 1 : Number(opacity);

        const transform = canvas.style.transform;
        if (transform && transform.startsWith("matrix(")) {
          const matrix = transform
            .substring(7, transform.length - 1)
            .split(",")
            .map((v) => Number(v.trim()));

          if (matrix.length === 6 && matrix.every((n) => !Number.isNaN(n))) {
            context.setTransform(
              matrix[0],
              matrix[1],
              matrix[2],
              matrix[3],
              matrix[4],
              matrix[5],
            );
          }
        } else {
          context.setTransform(1, 0, 0, 1, 0, 0);
        }

        context.drawImage(canvas, 0, 0);
      });

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.globalAlpha = 1;

      resolve(exportCanvas);
    });

    map.renderSync();
  });
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Couldn't encode the map image as a PNG."));
    }, "image/png");
  });
}

// Downloads the composited image. Failures stay silent to the user, as they
// were before this was promise-based — nothing has visibly started, so there's
// nothing hanging that needs explaining.
export async function exportMapImage(map) {
  try {
    const canvas = await composeMapCanvas(map);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "atlascope-map.png";
    link.click();
  } catch (error) {
    console.error("Map image export failed:", error);
  }
}

// Uploads the composited image to object storage and resolves with the storage
// key the server chose for it. This is the primitive: callers that only need to
// hand the key to another service use it directly, while uploadMapImage layers
// URL building on top. Rejects with a message fit to show a user.
/**
 * @param {import("ol").Map} map
 * @returns {Promise<string>}
 */
export async function storeMapImage(map) {
  // A stalled tile would leave composeMapCanvas's rendercomplete promise
  // unsettled forever, and with it whatever busy state the caller is showing.
  const canvas = await Promise.race([
    composeMapCanvas(map),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("the map took too long to render.")),
        RENDER_TIMEOUT_MS,
      ),
    ),
  ]);
  const blob = await canvasToPngBlob(canvas);

  const signResponse = await fetch(SIGN_ENDPOINT, { method: "POST" });
  if (!signResponse.ok) {
    // The function returns a legible message for missing config and blocked
    // origins; fall back to the status when there's nothing to read.
    const detail = await signResponse
      .json()
      .then((body) => body.error)
      .catch(() => null);
    throw new Error(detail || `Couldn't request an upload (${signResponse.status}).`);
  }

  const { hash, uploadUrl } = await signResponse.json();
  if (!hash || !uploadUrl) {
    throw new Error("The upload authorization came back malformed.");
  }

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": "image/png" },
  });
  if (!putResponse.ok) {
    throw new Error(`Storing the map image failed (${putResponse.status}).`);
  }

  return hash;
}

// Uploads the composited image and resolves with the storage hash plus the
// share URL built from urlTemplate, whose {hash} placeholder is replaced with
// the storage key. onUrl fires as soon as the URL is known so the caller can
// navigate a tab it opened up front — see the popup-blocker note in
// ExportShareButton. Rejects with a message fit to show a user.
/**
 * @param {import("ol").Map} map
 * @param {string} urlTemplate
 * @param {{ onUrl?: (url: string) => void }} [options]
 * @returns {Promise<{ hash: string, url: string }>}
 */
export async function uploadMapImage(map, urlTemplate, { onUrl } = {}) {
  // Checked before the upload, not after: a misconfigured button should fail
  // without having written an object nothing will ever link to.
  if (!urlTemplate || !urlTemplate.includes("{hash}")) {
    throw new Error(
      "this share button has no URL template with a {hash} placeholder.",
    );
  }

  const hash = await storeMapImage(map);
  const url = urlTemplate.replaceAll("{hash}", hash);
  if (onUrl) onUrl(url);
  return { hash, url };
}
