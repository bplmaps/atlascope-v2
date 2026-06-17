<script>
  import { onMount } from "svelte";

  import Fa from "svelte-fa";
  import { faPenToSquare, faStopCircle } from "@fortawesome/free-solid-svg-icons";

  import AtlascopeLogo from "./ui/AtlascopeLogo.svelte";
  import MapControls from "./mapControls/ControlPanel.svelte";
  import GeolocationModal from "./modals/GeolocationModal.svelte";
  import AnnotationEntryForm from "./annotations/AnnotationEntryForm.svelte";
  import AnnotationsListModal from "./annotations/AnnotationsListModal.svelte";
  import LightIconButton from "./ui/LightIconButton.svelte";
  import DragHandle from "./map/DragHandle.svelte";

  import "ol/ol.css";
  import { Map, View } from "ol";
  import TileLayer from "ol/layer/Tile";
  import { WarpedMapLayer } from "@allmaps/openlayers";
  import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
  import VectorSource from "ol/source/Vector";
  import VectorLayer from "ol/layer/Vector";
  import { Fill, Stroke, Style, Circle } from "ol/style";

  import { intersector, bboxesOverlap } from "./helpers/intersector";

  import { mapState, appState, allLayers } from "./state.svelte.js";
  import { registerMap, unregisterMap } from "./map/mapActions.js";
  import { createLayerSwitcher, pickBestOverlayLayer } from "./map/layerSwitching.js";
  import { createViewModeHandlers } from "./map/viewModeRendering.js";
  import { createAnnotationManager } from "./map/annotationManager.js";
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
    minZoom: 14,
  });

  const changeLayer = createLayerSwitcher(olLayers, warpedLayers);

  let loadedAnnotationsList = $state([]);
  let annotationEntryCoords = $state([0, 0]);
  let annotationExtentCoords = $state(null);

  const annotations = createAnnotationManager({
    getMap: () => map,
    getView: () => view,
    changeLayer,
    onDrawEnd: (extent, pixel) => {
      annotationExtentCoords = extent;
      annotationEntryCoords = pixel;
    },
  });

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
    // just load the maptiler streets
    // (uses the visibility computed on the previous move, since the
    // debounced recompute above hasn't run yet)

    const baseVisible = allLayers.visibility[mapState.layers.base.id];
    if (!mapState.lockLayers && baseVisible < 0.4) {
      changeLayer("base", "maptiler-streets")
    }
  }

  function loadAnnotations() {
    loadedAnnotationsList = [];
    annotations.loadWithinCurrentExtent(
      (annotation) => {
        loadedAnnotationsList = [...loadedAnnotationsList, annotation];
      },
      () => {
        loadedAnnotationsList = [
          {
            body: "No annotations here yet. Click here to add one!",
            annotations: false,
          },
        ];
      },
    );
  }

  const closeAnnotationListModal = () => {
    annotations.clearLoaded();
    loadedAnnotationsList = [];
  };

  function moveMapToAnnotation(d) {
    annotations.showAnnotation(loadedAnnotationsList[d]);
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
        annotations.loadedLayer,
        markerLayer,
      ],
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
      pixelRatio: window.devicePixelRatio,
    });
    olLayers.overlay.on("prerender", viewModeHandlers.prerender);
    olLayers.overlay.on("postrender", viewModeHandlers.postrender);

    map.on("moveend", mapMoved);

    dragXY = [window.innerWidth / 4, window.innerHeight / 4];
    mapMoved();
    mapState.mounted = true;

    registerMap({
      map,
      view,
      markerSource: markerGeometrySource,
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

  $effect(() => {
    if (mapState.annotationEntry) {
      annotations.enableEntryMode();
    } else {
      annotations.disableEntryMode();
    }
  });

  $effect(() => {
    if (mapState.annotationRead) {
      loadAnnotations();
      mapState.annotationRead = false;
    }
  });
</script>

<section id="map">
  <div id="map-div"></div>

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
      closeAnnotationListModal();
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

  {#if mapState.annotationEntry}
    <div
      class="absolute top-5 right-5 max-w-xs bg-slate-100 py-3 px-4 rounded shadow"
    >
      <strong
        ><Fa icon={faPenToSquare} class="inline mr-2" /> Annotation mode enabled</strong
      >
      <p class="text-sm">
        Click once to begin drawing a box, then click again to finish.
      </p>
      <LightIconButton
        onclick={annotations.disableEntryMode}
        icon={faStopCircle}
        label="Stop annotating"
        size="sm"
      />
    </div>
  {/if}

  {#if mapState.annotationSave}
    <AnnotationEntryForm
      pos={annotationEntryCoords}
      featureExtent={annotationExtentCoords}
      layerID={mapState.layers.overlay.id}
      oncancel={annotations.cancelEntry}
    />
  {/if}

  {#if loadedAnnotationsList.length > 0}
    <AnnotationsListModal
      annotationsList={loadedAnnotationsList}
      {closeAnnotationListModal}
      {moveMapToAnnotation}
    />
  {/if}

  {#if !mapState.annotationEntry && loadedAnnotationsList.length === 0 && !appState.tour.active}
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
</style>
