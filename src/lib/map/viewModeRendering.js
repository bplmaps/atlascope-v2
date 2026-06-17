import { mapState } from "../state.svelte.js";

// Builds the prerender/postrender handlers that clip the overlay layer's
// canvas for the spyglass, swipe, and opacity view modes. The getters are
// closures over the component's reactive state so this module stays
// non-reactive.
export function createViewModeHandlers({
  overlayLayer,
  getDragXY,
  getOpacity,
  dragAdjuster,
  pixelRatio,
}) {
  const prerender = (event) => {
    if (mapState.viewMode === "opacity") {
      overlayLayer.setOpacity(getOpacity() / 100);
    } else {
      overlayLayer.setOpacity(1);
      const ctx = event.context;
      const dragXY = getDragXY();

      ctx.save();
      ctx.beginPath();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";

      if (mapState.viewMode === "swipe-y") {
        ctx.rect(0, 0, ctx.canvas.width, (dragXY[1] + dragAdjuster) * pixelRatio);
      } else if (mapState.viewMode === "swipe-x") {
        ctx.rect(0, 0, (dragXY[0] + dragAdjuster) * pixelRatio, ctx.canvas.height);
      } else if (mapState.viewMode === "glass") {
        ctx.arc(
          ctx.canvas.width / 2,
          ctx.canvas.height / 2,
          Math.abs(
            Math.floor(
              Math.sqrt(
                Math.pow(
                  (dragXY[0] + dragAdjuster - window.innerWidth / 2) *
                    pixelRatio,
                  2,
                ) +
                  Math.pow(
                    (dragXY[1] + dragAdjuster - window.innerHeight / 2) *
                      pixelRatio,
                    2,
                  ),
              ),
            ),
          ),
          0,
          2 * Math.PI,
        );
      } else ctx.fillStyle = "rgba(10,10,10,0.85)";
      ctx.fill();

      ctx.stroke();
      ctx.clip();
    }
  };

  // after rendering the layer, restore the canvas context
  const postrender = (event) => {
    event.context.restore();
  };

  return { prerender, postrender };
}
