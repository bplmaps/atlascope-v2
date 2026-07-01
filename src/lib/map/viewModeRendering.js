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
}) {
  const prerender = (event) => {
    if (mapState.viewMode === "opacity") {
      overlayLayer.setOpacity(getOpacity() / 100);
    } else {
      overlayLayer.setOpacity(1);
      const ctx = event.context;
      const dragXY = getDragXY();

      // The map applies pan/zoom/rotation to the layer canvas via a CSS
      // transform, so the 2D context itself draws in an unrotated, device-pixel
      // space. We describe the clip in *screen* coordinates and set the context
      // transform to the inverse of the canvas's CSS transform, so the clip
      // stays screen-axis-aligned under map rotation (an axis-aligned rect would
      // otherwise tilt with the canvas) and correctly scaled at any device pixel
      // ratio — no separate pixelRatio factor needed.
      const cssTransform = ctx.canvas.style.transform;
      const screenToCanvas = (
        cssTransform ? new DOMMatrix(cssTransform) : new DOMMatrix()
      ).inverse();

      ctx.save();
      const baseTransform = ctx.getTransform();
      ctx.setTransform(screenToCanvas);
      ctx.beginPath();

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";

      // Large enough to blanket the viewport for the half-plane (swipe) clips;
      // the rasterizer bounds it to the canvas, so the exact value is unimportant.
      const BIG = 100000;

      if (mapState.viewMode === "swipe-y") {
        const y = dragXY[1] + dragAdjuster;
        ctx.rect(-BIG, -BIG, 2 * BIG, y + BIG); // everything above the handle
      } else if (mapState.viewMode === "swipe-x") {
        const x = dragXY[0] + dragAdjuster;
        ctx.rect(-BIG, -BIG, x + BIG, 2 * BIG); // everything left of the handle
      } else if (mapState.viewMode === "glass") {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const radius = Math.hypot(
          dragXY[0] + dragAdjuster - cx,
          dragXY[1] + dragAdjuster - cy,
        );
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      } else ctx.fillStyle = "rgba(10,10,10,0.85)";

      ctx.fill();
      ctx.stroke();
      ctx.clip();

      // The clip is baked into canvas (device) space by clip(), so restore the
      // context transform for OpenLayers' own drawing of the layer.
      ctx.setTransform(baseTransform);
    }
  };

  // after rendering the layer, restore the canvas context
  const postrender = (event) => {
    event.context.restore();
  };

  return { prerender, postrender };
}
