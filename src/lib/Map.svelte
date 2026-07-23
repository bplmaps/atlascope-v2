<script>
  import { onMount } from "svelte";

  import AtlascopeLogo from "./ui/AtlascopeLogo.svelte";
  import MapControls from "./mapControls/ControlPanel.svelte";
  import GeolocationModal from "./modals/GeolocationModal.svelte";
  import DragHandle from "./map/DragHandle.svelte";

  import "ol/ol.css";
  import { Map, View } from "ol";
  import TileLayer from "ol/layer/Tile";
  import Overlay from "ol/Overlay";
  import { WarpedMapLayer } from "@allmaps/openlayers";
  import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
  import VectorSource from "ol/source/Vector";
  import VectorLayer from "ol/layer/Vector";
  import { Fill, Stroke, Style, Circle } from "ol/style";
  import Icon from "ol/style/Icon";

  import { intersector, bboxesOverlap } from "./helpers/intersector";

  import instanceVariables from "../config/instance.json";
  import { annotationsEnabled } from "../config/features.js";
  import { mapState, appState, allLayers } from "./state.svelte.js";
  import { registerMap, unregisterMap, reloadScratchData, clearScratchData } from "./map/mapActions.js";
  import { createLayerSwitcher, pickBestOverlayLayer } from "./map/layerSwitching.js";
  import { createViewModeHandlers } from "./map/viewModeRendering.js";
  import { exportMapImage } from "./map/exportImage.js";

  let map;
  let olLayers = {
    base: new TileLayer(),
    overlay: new TileLayer(),
  };
  // Custom Allmaps maps are only allowed on the base slot (the base is never
  // canvas-clipped by the glass/swipe view modes, so a WebGL2 WarpedMapLayer
  // renders correctly there).
  let warpedLayers = {
    base: new WarpedMapLayer(),
  };
  warpedLayers.base.setVisible(false);

  let opacitySliderValue = $state(50);
  let dragXY = $state([0, 0]);
  const dragAdjuster = 14;

  let view = new View({
    center: fromLonLat(mapState.center),
    zoom: mapState.zoom,
    minZoom: instanceVariables.map.minZoom,
  });

  const changeLayer = createLayerSwitcher(olLayers, warpedLayers);

  // The user-annotation feature is optional per instance; its component
  // (map wiring + UI) is only fetched when the flag is on, keeping
  // annotation code out of the bundle for instances that disable it
  let MapAnnotations = $state(null);

  let markerGeometrySource = new VectorSource({ wrapX: false });
  let markerLayer = new VectorLayer({
    source: markerGeometrySource,
    style: new Style({
      image: new Circle({
        radius: 10,
        stroke: new Stroke({ color: "rgba(25, 106, 247, 0.92)", width: 4 }),
        fill: new Fill({ color: "rgba(255, 203, 230, 0.5)" }),
      }),
    }),
  });

  // Scratch layer holding point data loaded from a research dataConnector.
  // Each feature carries a `_label` and `_targetUrl` (both surfaced in the
  // click popup, set in mapActions.loadScratchData). Points are unlabeled on
  // the map itself and drawn as a hand-built "+" SVG marker (white halo under
  // a rose plus for contrast over both historic and modern basemaps).
  const plusIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="7.25" fill="#ffffff" stroke="rgb(180,30,90)" stroke-width="1.5"/>
      <path d="M9 5.5 V12.5 M5.5 9 H12.5" stroke="rgb(180,30,90)" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  let scratchSource = new VectorSource({ wrapX: false });
  let scratchLayer = new VectorLayer({
    source: scratchSource,
    style: new Style({
      image: new Icon({
        src: "data:image/svg+xml;utf8," + encodeURIComponent(plusIconSvg),
      }),
    }),
  });

  // Click popup for scratch points. `popupEl` is bound to the DOM node used by
  // an ol/Overlay; `scratchPopup` drives its reactive content.
  let popupEl;
  let popupOverlay;
  let scratchPopup = $state({ visible: false, label: "", url: "" });

  // Dismiss a lingering point popup when the scratch layer is cleared — its
  // feature no longer exists on the map.
  $effect(() => {
    if (!mapState.activeDataConnectorName && scratchPopup.visible) {
      scratchPopup = { visible: false, label: "", url: "" };
      popupOverlay?.setPosition(undefined);
    }
  });

  // Debounce timer for mapMoved function
  let mapMovedTimeout;

  // This function updates the `allLayers` visibility record every time the map is moved,
  // to figure out how many layers are available in the new viewport.
  // It does it by running the `intersector` function on each layer's geometry relative
  // to the viewport extent and writing the coverage fraction into `allLayers.visibility`
  function mapMoved() {
    // Clear any existing timeout
    if (mapMovedTimeout) {
      clearTimeout(mapMovedTimeout);
    }

    // Set a new timeout to execute the function after 500ms
    mapMovedTimeout = setTimeout(() => {
      mapState.center = toLonLat(view.getCenter());
      mapState.zoom = view.getZoom();
      mapState.rotation = view.getRotation();

      const extent = transformExtent(
        view.calculateExtent(),
        "EPSG:3857",
        "EPSG:4326",
      );
      mapState.extent = extent;

      // Loaded scratch data never auto-refreshes; the first map move after a
      // (re)load enables the badge's "reload data for this area" button. (A
      // fresh load doesn't move the map, so this only fires on user navigation.)
      if (mapState.activeDataConnectorName) {
        mapState.scratchReloadAvailable = true;
      }

      const visibility = {};
      allLayers.layers.forEach((lyr) => {
        if (lyr.properties.globalExtent) {
          visibility[lyr.properties.identifier] = 1.0;
        } else if (lyr.bbox && !bboxesOverlap(lyr.bbox, extent)) {
          // bounding boxes don't even touch — skip the expensive
          // polygon intersection entirely
          visibility[lyr.properties.identifier] = 0;
        } else {
          visibility[lyr.properties.identifier] = intersector(
            lyr.geometry,
            extent,
          );
        }
      });
      allLayers.visibility = visibility;

      const bestNewLayer = pickBestOverlayLayer(visibility);
      if (bestNewLayer) {
        changeLayer("overlay", bestNewLayer);
        mapState.layerChangePopup = true;
        setTimeout(() => {
          mapState.layerChangePopup = false;
        }, 5000);
      }
    }, 500);

    // Implement a simpler check for the base layer;
    // if the current layer is less than 40% visible,
    // just load the instance's fallback base layer
    // (uses the visibility computed on the previous move, since the
    // debounced recompute above hasn't run yet)

    const baseVisible = allLayers.visibility[mapState.layers.base.id];
    if (!mapState.lockLayers && baseVisible < 0.4) {
      changeLayer("base", instanceVariables.map.fallbackBaseLayerId)
    }
  }

  // We wait to initialize the main `map` object until the Svelte module has mounted, otherwise we won't have a sized element in the DOM onto which to bind it
  onMount(() => {
    map = new Map({
      target: "map-div",
      controls: [],
      view: view,
      layers: [
        olLayers.base,
        warpedLayers.base,
        olLayers.overlay,
        markerLayer,
        scratchLayer,
      ],
    });

    // Popup overlay for scratch points, and a click handler that shows it when
    // a scratch feature is hit (and dismisses it on an empty click).
    popupOverlay = new Overlay({
      element: popupEl,
      positioning: "bottom-center",
      offset: [0, -12],
      stopEvent: true,
    });
    map.addOverlay(popupOverlay);

    map.on("singleclick", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f, {
        layerFilter: (l) => l === scratchLayer,
        hitTolerance: 6,
      });
      if (feature) {
        scratchPopup = {
          visible: true,
          label: feature.get("_label") || "",
          url: feature.get("_targetUrl") || "",
        };
        popupOverlay.setPosition(evt.coordinate);
      } else if (scratchPopup.visible) {
        scratchPopup = { visible: false, label: "", url: "" };
        popupOverlay.setPosition(undefined);
      }
    });

    changeLayer("base", mapState.layers.base.id, true);
    changeLayer("overlay", mapState.layers.overlay.id, true);

    // Renders the spyglass, swipe, or opacity effect by clipping the
    // overlay layer's canvas around the drag handle position
    const viewModeHandlers = createViewModeHandlers({
      overlayLayer: olLayers.overlay,
      getDragXY: () => dragXY,
      getOpacity: () => opacitySliderValue,
      dragAdjuster,
    });
    olLayers.overlay.on("prerender", viewModeHandlers.prerender);
    olLayers.overlay.on("postrender", viewModeHandlers.postrender);

    map.on("moveend", mapMoved);

    dragXY = [window.innerWidth / 4, window.innerHeight / 4];
    mapMoved();
    mapState.mounted = true;

    if (annotationsEnabled) {
      import("./annotations/MapAnnotations.svelte").then((m) => {
        MapAnnotations = m.default;
      });
    }

    registerMap({
      map,
      view,
      markerSource: markerGeometrySource,
      scratchSource,
      changeLayer,
      warpedLayers,
      olLayers,
    });

    const handleKeydown = (event) => {
      if (
        event.code === "KeyE" &&
        event.shiftKey &&
        event.altKey
      ) {
        event.preventDefault();
        exportMapImage(map);
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      unregisterMap();
    };
  });

</script>

<section id="map">
  <div id="map-div"></div>

  <div
    bind:this={popupEl}
    class="scratch-popup {scratchPopup.visible ? '' : 'hidden'}"
  >
    {#if scratchPopup.visible}
      <button
        class="scratch-popup-close"
        aria-label="Close"
        onclick={() => {
          scratchPopup = { visible: false, label: "", url: "" };
          popupOverlay.setPosition(undefined);
        }}>×</button
      >
      {#if scratchPopup.url}
        <a
          href={scratchPopup.url}
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-700 font-semibold hover:underline">{scratchPopup.label}</a
        >
      {:else}
        <span class="font-semibold text-gray-900">{scratchPopup.label}</span>
      {/if}
    {/if}
  </div>

  {#if mapState.activeDataConnectorName}
    <div
      class="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-white/95 text-gray-900 py-2 px-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-3"
    >
      <span class="font-semibold text-sm">
        {mapState.scratchPointCount} point{mapState.scratchPointCount === 1
          ? ""
          : "s"} displayed from {mapState.activeDataConnectorName}
      </span>
      <button
        class="bg-rose-700 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-rose-800 cursor-pointer"
        onclick={() => clearScratchData()}>Clear data</button
      >
      <button
        class="rounded px-3 py-1 text-sm font-semibold {mapState.scratchReloadAvailable
          ? 'bg-sky-700 text-white hover:bg-sky-800 cursor-pointer'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
        disabled={!mapState.scratchReloadAvailable}
        onclick={() => reloadScratchData(mapState.extent)}
        >Reload data for this area</button
      >
    </div>
  {/if}

  <DragHandle
    bind:dragXY
    bind:opacitySliderValue
    {dragAdjuster}
    onrender={() => {
      map.render();
    }}
  />

  <div
    onclick={() => {
      appState.tour.active = false;
      appState.modals.splash = true;
    }}
    class="absolute top-0 w-24 left-5 bg-white p-2 rounded-b-lg cursor-pointer transition-all drop-shadow hover:pt-3 hover:bg-gray-50 hover:ring-2 hover:ring-red-200"
  >
    <AtlascopeLogo />
  </div>

  {#if appState.modals.geolocation}
    <div
      class="absolute top-5 right-5 max-w-sm bg-slate-100 py-3 px-4 rounded shadow"
    >
      <GeolocationModal />
    </div>
  {/if}

  {#if MapAnnotations && mapState.mounted}
    <MapAnnotations getMap={() => map} getView={() => view} {changeLayer} />
  {/if}

  {#if !mapState.annotationEntry && !mapState.annotationsListShowing && !appState.tour.active}
    <MapControls />
  {/if}
</section>

<style>
  section {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  #map-div {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .scratch-popup {
    position: relative;
    background: white;
    padding: 8px 26px 8px 12px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    max-width: 240px;
    font-size: 0.875rem;
    line-height: 1.2;
  }

  .scratch-popup::after {
    content: "";
    position: absolute;
    bottom: -7px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid white;
  }

  .scratch-popup-close {
    position: absolute;
    top: 2px;
    right: 6px;
    border: none;
    background: none;
    font-size: 1rem;
    line-height: 1;
    color: #6b7280;
    cursor: pointer;
  }

  .scratch-popup-close:hover {
    color: #111827;
  }
</style>
