import TileLayer from "ol/layer/Tile";
import TileImage from "ol/source/TileImage";
import XYZ from "ol/source/XYZ";
import TileGrid from "ol/tilegrid/TileGrid";
import { toSize } from "ol/size";

// Flattens the map's layer canvases into a single PNG. Three consumers:
// exportMapImage downloads the file (Shift+Alt+E in Map.svelte, or Shift+Alt+2
// for a 2x render with deeper tiles), storeMapImage
// writes it to object storage and returns the storage key, and uploadMapImage
// builds a share URL from that key (reached through shareMapImage in
// mapActions.js, which is what ExportShareButton calls).

const SIGN_ENDPOINT = "/.netlify/functions/sign-image-upload";

// Ceiling on the rendercomplete wait in storeMapImage and the scaled export, so a stalled tile
// surfaces as an error the caller can show instead of a promise that never
// settles.
const RENDER_TIMEOUT_MS = 20000;

// Composites every canvas inside #map-div onto one canvas as they stand right
// now, preserving each layer's opacity and transform. The output is the map's
// CSS size times scale; layer canvases are mapped into it through their CSS
// transforms, so whatever pixel ratio they rendered at lands at the right size.
// Throws with a message fit to show a user.
function drawLayerCanvases(map, scale) {
  const size = map.getSize();
  if (!size) throw new Error("The map has no size to export.");

  const exportCanvas = document.createElement("canvas");
  const [width, height] = size;
  exportCanvas.width = Math.round(width * scale);
  exportCanvas.height = Math.round(height * scale);
  const context = exportCanvas.getContext("2d");
  if (!context) {
    throw new Error("Couldn't get a drawing context for the export.");
  }

  const canvases = document.querySelectorAll(
    "#map-div canvas:not([data-export-still])",
  );

  canvases.forEach((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    if (canvas.width === 0 || canvas.height === 0) return;

    const opacity =
      (canvas.parentElement && canvas.parentElement.style.opacity) || "";
    context.globalAlpha = opacity === "" ? 1 : Number(opacity);

    const transform = canvas.style.transform;
    const matrix =
      transform && transform.startsWith("matrix(")
        ? transform
            .substring(7, transform.length - 1)
            .split(",")
            .map((v) => Number(v.trim()))
        : null;

    if (matrix && matrix.length === 6 && matrix.every((n) => !Number.isNaN(n))) {
      const [a, b, c, d, e, f] = matrix.map((n) => n * scale);
      context.setTransform(a, b, c, d, e, f);
      context.drawImage(canvas, 0, 0);
    } else {
      // No CSS transform (the Allmaps WebGL canvas): it fills the map at
      // devicePixelRatio, so stretch it to the map's CSS box.
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.drawImage(canvas, 0, 0, width, height);
    }
  });

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalAlpha = 1;
  return exportCanvas;
}

// Waits for the next completed render, then composites it (see
// drawLayerCanvases).
export function composeMapCanvas(map, scale = 1) {
  return new Promise((resolve, reject) => {
    if (!map) {
      reject(new Error("There's no map to export."));
      return;
    }

    map.once("rendercomplete", function () {
      try {
        resolve(drawLayerCanvases(map, scale));
      } catch (error) {
        reject(error);
      }
    });

    map.renderSync();
  });
}

function composeWithTimeout(map, scale = 1) {
  return Promise.race([
    composeMapCanvas(map, scale),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("the map took too long to render.")),
        RENDER_TIMEOUT_MS,
      ),
    ),
  ]);
}

// A stand-in for a tile source whose grid cells are 1/scale the size at scale
// times the resolution, so each tile index still covers the same ground and
// the original URL function still applies. OpenLayers picks the level whose
// resolution matches the view, which on this grid is one level deeper (at
// scale 2), and tilePixelRatio tells it each image fills scale × the cell.
function deeperTileSource(source, scale) {
  const grid = source.getTileGrid();
  const tileUrlFunction = source.getTileUrlFunction();
  if (!grid || !tileUrlFunction) return null;

  const minZoom = grid.getMinZoom();
  const [tileWidth, tileHeight] = toSize(grid.getTileSize(minZoom));
  return new XYZ({
    projection: source.getProjection() ?? undefined,
    tileGrid: new TileGrid({
      extent: grid.getExtent(),
      origin: grid.getOrigin(minZoom),
      resolutions: grid.getResolutions().map((r) => r * scale),
      tileSize: [tileWidth / scale, tileHeight / scale],
      minZoom,
    }),
    tilePixelRatio: scale,
    tileUrlFunction,
    crossOrigin: "anonymous",
  });
}

// Renders the live map at scale × its pixel ratio with every raster tile layer
// swapped for a deeper-tile stand-in, composites it, then puts everything
// back. A source that something else replaced mid-export (a layer switch) is
// left alone rather than clobbered.
async function composeScaledMapCanvas(map, scale) {
  const originalPixelRatio = map.getPixelRatio();
  const swaps = map
    .getAllLayers()
    .filter((layer) => layer instanceof TileLayer)
    .map((layer) => {
      const original = layer.getSource();
      if (!(original instanceof TileImage)) return null;
      const deeper = deeperTileSource(original, scale);
      return deeper ? { layer, original, deeper } : null;
    })
    .filter(Boolean);

  const unfreeze = freezeViewport(map);
  swaps.forEach(({ layer, deeper }) => layer.setSource(deeper));
  map.setPixelRatio(scale);
  try {
    return await composeWithTimeout(map, scale);
  } finally {
    swaps.forEach(({ layer, original, deeper }) => {
      if (layer.getSource() === deeper) layer.setSource(original);
    });
    map.setPixelRatio(originalPixelRatio);
    // The restored sources need a frame or two to repaint from cache; the
    // timeout keeps a stalled tile from leaving the map frozen.
    map.once("rendercomplete", unfreeze);
    setTimeout(unfreeze, RENDER_TIMEOUT_MS);
    map.render();
  }
}

// Lays a still of the current frame over the viewport while the scaled render
// swaps sources underneath, hiding the blank tiles in between and swallowing
// input that would otherwise move the map mid-export. Returns the remover. The
// Allmaps WebGL canvas has likely been cleared by now, so it shows blank here.
function freezeViewport(map) {
  let still;
  try {
    still = drawLayerCanvases(map, window.devicePixelRatio);
  } catch (error) {
    console.error("Couldn't freeze the map during export:", error);
    return () => {};
  }
  still.dataset.exportStill = "";
  Object.assign(still.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
  });
  map.getViewport().appendChild(still);
  return () => still.remove();
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
// nothing hanging that needs explaining. A scale above 1 re-renders the map
// with deeper tiles (see composeScaledMapCanvas) rather than upsampling.
/**
 * @param {import("ol").Map} map
 * @param {{ scale?: number }} [options]
 */
export async function exportMapImage(map, { scale = 1 } = {}) {
  try {
    const canvas =
      scale === 1
        ? await composeMapCanvas(map)
        : await composeScaledMapCanvas(map, scale);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download =
      scale === 1 ? "atlascope-map.png" : `atlascope-map@${scale}x.png`;
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
  const canvas = await composeWithTimeout(map);
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
