<script>
  import Fa from "svelte-fa";
  import { faHand } from "@fortawesome/free-solid-svg-icons";

  import { mapState } from "../state.svelte.js";

  // dragXY and opacitySliderValue are bindable because Map.svelte's
  // prerender clip handler reads them on every frame
  let {
    dragXY = $bindable(),
    opacitySliderValue = $bindable(),
    dragAdjuster,
    onrender,
  } = $props();

  let draggingFlag = $state(false);

  function manipulateDrag(e) {
    // self-heal if the mouseup landed before the effect attached listeners
    if (!e.touches && e.buttons === 0) {
      draggingFlag = false;
      return;
    }

    e.preventDefault();

    let posX, posY;

    if (e.touches) {
      posX = e.targetTouches.item(0).clientX;
      posY = e.targetTouches.item(0).clientY;
    } else {
      posX = e.clientX || e.pageX;
      posY = e.clientY || e.pageY;
    }

    dragXY = [
      Math.min(window.innerWidth - 40, Math.max(10, posX - dragAdjuster)),
      Math.min(window.innerHeight - 150, Math.max(10, posY - dragAdjuster)),
    ];
    onrender();
  }

  // Listeners go on the window (so a drag keeps tracking outside the
  // handle) and exist only while a drag is in progress. touchmove must be
  // registered non-passive for preventDefault to work.
  $effect(() => {
    if (!draggingFlag) return;

    const stopDragging = () => {
      draggingFlag = false;
    };

    window.addEventListener("mousemove", manipulateDrag);
    window.addEventListener("touchmove", manipulateDrag, { passive: false });
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchend", stopDragging);

    return () => {
      window.removeEventListener("mousemove", manipulateDrag);
      window.removeEventListener("touchmove", manipulateDrag);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchend", stopDragging);
    };
  });
</script>

<div
  id="drag-handle"
  class="select-none cursor-move rounded-full bg-pink-800 ring-2 ring-white p-2 text-white drop-shadow hover:ring-4 hover:bg-pink-900 transition {mapState.viewMode ===
  'opacity'
    ? 'hidden'
    : ''}"
  style="left: {dragXY[0]}px; top: {dragXY[1]}px"
  onmousedown={() => {
    draggingFlag = true;
  }}
  ontouchstart={() => {
    draggingFlag = true;
  }}
>
  <Fa icon={faHand} />
</div>

<div
  id="opacity-control-holder"
  class="absolute top-2 right-2 w-1/3 bg-gray-50 p-2 rounded {mapState.viewMode ===
  'opacity'
    ? ''
    : 'hidden'}"
>
  <input
    id="default-range"
    type="range"
    bind:value={opacitySliderValue}
    oninput={onrender}
    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-900"
  />
  <div class="text-sm font-semibold">Opacity {opacitySliderValue}%</div>
</div>

<style>
  #drag-handle {
    position: absolute;
  }
</style>
