// Composites the map's layer canvases into a single PNG and triggers a
// download. Bound to Shift+Alt+E in Map.svelte.
export function exportMapImage(map) {
  if (!map) return;

  map.once("rendercomplete", function () {
    const size = map.getSize();
    if (!size) return;

    const exportCanvas = document.createElement("canvas");
    const [width, height] = size;
    exportCanvas.width = width;
    exportCanvas.height = height;
    const context = exportCanvas.getContext("2d");
    if (!context) return;

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

    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = "atlascope-map.png";
    link.click();
  });

  map.renderSync();
}
