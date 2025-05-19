<script>
  import { onMount } from "svelte";

  import Fa from "svelte-fa";
  import {
    faHand,
    faPenToSquare,
    faStopCircle,
  } from "@fortawesome/free-solid-svg-icons";

  import AtlascopeLogo from "./AtlascopeLogo.svelte";
  import MapControls from "./MapControls.svelte";
  import GeolocationModal from "./GeolocationModal.svelte";
  import AnnotationEntryForm from "./AnnotationEntryForm.svelte";
  import AnnotationsListModal from "./AnnotationsListModal.svelte";
  import LightIconButton from "./LightIconButton.svelte";

  import "ol/ol.css";
  import { Map, View } from "ol";
  import TileLayer from "ol/layer/Tile";
  import XYZ from "ol/source/XYZ";
  import TileJSON from "ol/source/TileJSON";
  import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
  import Draw, { createBox } from "ol/interaction/Draw";
  import VectorSource from "ol/source/Vector";
  import VectorLayer from "ol/layer/Vector";
  import Feature from "ol/Feature";
  import { fromExtent } from "ol/geom/Polygon";
  import Point from "ol/geom/Point";
  import { Fill, Stroke, Style, Circle } from "ol/style";

  import { intersector } from "./helpers/intersector";
  import {
    getAnnotationsWithinExtent,
    getSingleAnnotation,
  } from "./helpers/faunaFunctions";

  import { allLayers, appState } from "./stores.js";
  import instanceVariables from "../config/instance.json";

  const pixelRatio = window.devicePixelRatio;

  let map;

  export let urlParams = {};

  export let mapState = {
    mounted: false,
    layers: {
      base: {
        id: null,
        properties: null,
        olLayer: new TileLayer(),
      },
      overlay: {
        id: null,
        properties: null,
        olLayer: new TileLayer(),
      },
    },
    viewMode: urlParams.mode ? urlParams.mode : "glass",
    annotationMode: false,
    annotationEntry: false,
    layerChangePopup: false,
    center: null,
    zoom: null,
    extent: null,
  };

  let opacitySliderValue = 50;

  let view = new View({
    center:
      urlParams.view && urlParams.center
        ? fromLonLat(urlParams.center.split(",").map((k) => +k))
        : fromLonLat(instanceVariables.defaultStartLocation.center),
    zoom:
      urlParams.view && urlParams.zoom
        ? +urlParams.zoom
        : instanceVariables.defaultStartLocation.zoom,
    minZoom: 14,
  });

  let annotationDrawer;
  let annotationDrawerGeometrySource = new VectorSource({ wrapX: false });
  let annotationDrawerLayer = new VectorLayer({
    source: annotationDrawerGeometrySource,
  });

  let loadedAnnotationsGeometrySource = new VectorSource({ wrapX: false });
  let loadedAnnotationsLayer = new VectorLayer({
    source: loadedAnnotationsGeometrySource,
    style: new Style({
      stroke: new Stroke({
        color: "rgba(255, 255, 255, 0.9)",
        width: 5,
      }),
    }),
  });

  let loadedAnnotationsList = [];

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

  let annotationEntryCoords = [0, 0];
  let annotationExtentCoords;

  // the magic exportable function that we use whenever we want to adjust the map's center, zoom, viewMode, or layers from another component
  export const changeMapView = (options) => {
    if (options.viewMode) {
      changeMode(options.viewMode);
    }

    if (options.overlay) {
      changeLayer("overlay", options.overlay);
    }

    if (options.base) {
      changeLayer("base", options.base);
    }

    if (options.center || options.zoom) {
      let m = {};
      if (options.center) {
        m.center = fromLonLat(options.center);
      }
      if (options.zoom) {
        m.zoom = options.zoom;
      }

      if (!options.duration && options.duration != 0) {
        m.duration = 900;
      } else {
        m.duration = options.duration;
      }

      view.animate(m);

      if (options.viewMode) {
        changeMode(options.viewMode);
      }
    }

    if (options.dropMarkerAtPoint) {
      const targetPoint = fromLonLat(options.center);
      markerGeometrySource.clear();
      markerGeometrySource.addFeature(
        new Feature({ geometry: new Point(targetPoint) })
      );
    }
  };

  const getLayerDataById = (layerId) => {
    let p = $allLayers.find((d) => d.properties.identifier === layerId);
    if (!p) {
      p = instanceVariables.referenceLayers.find(
        (d) => d.properties.identifier === layerId
      );
    }
    return p;
  };

  // function for changing the view mode
  const changeMode = (vm) => {
    mapState.viewMode = vm;
    map.render();
  };

  // function for changing the layer, we export it so that the outer app can also access this function
  const changeLayer = (layer, id) => {
    if (id != mapState.layers[layer].id) {
      let newLayer = getLayerDataById(id);

      if (newLayer.properties.source.type === "tilejson" && newLayer.properties.identifier === "maptiler-streets") {
        mapState.layers[layer].olLayer.setSource(
          new TileJSON({
            url: newLayer.properties.source.url,
            crossOrigin: "anonymous",
            tileSize: 512,
          })
        );
      } else if (newLayer.properties.source.type === "tilejson" && newLayer.properties.identifier !== "maptiler-streets") {
        mapState.layers[layer].olLayer.setSource(
          new TileJSON({
            url: newLayer.properties.source.url,
            crossOrigin: "anonymous",
          })
        );
      } else if (newLayer.properties.source.type === "xyz") {
        mapState.layers[layer].olLayer.setSource(
          new XYZ({
            url: newLayer.properties.source.url,
            crossOrigin: "anonymous",
          })
        );
      }

      mapState.layers[layer].id = newLayer.properties.identifier;
      mapState.layers[layer].properties = newLayer.properties;
    }
  };

  // This function updates the `allLayers` store every time the map is moved, to figure out how many layers are available in the new viewport
  // It does it by running the `intersector` function on each layer's geometry relative to the viewport extent
  // and then sets the `extentVisible` property on that layer in the store
  function mapMoved() {
    mapState.center = toLonLat(view.getCenter()).map((d) => d.toFixed(5));
    mapState.zoom = view.getZoom().toFixed(2);
    mapState.extent = transformExtent(
      view.calculateExtent(),
      "EPSG:3857",
      "EPSG:4326"
    );

    const extent = map.getView().calculateExtent(map.getSize());
    allLayers.update((a) => {
      return a.map((layer) => {
        let l = layer;
        if (l.properties.globalExtent) {
          l.extentVisible = 1.0;
        } else {
          l.extentVisible = intersector(l.geometry, extent);
        }
        return l;
      });
    });

    let currentLayerInfo = getLayerDataById(mapState.layers.overlay.id);

    // Implement a double check process
    // If the current overlay layer is less than 40% visible AND there is another layer available that's more than 20% better than it, switch
    if (currentLayerInfo.extentVisible < 0.4 && $allLayers.filter(d=>d.extentVisible > (currentLayerInfo.extentVisible+0.2)).length > 0 ) {
      let bestNewLayer = $allLayers.sort((a, b) => {
        return b.extentVisible - a.extentVisible;
      })[0].properties.identifier;

      if (bestNewLayer != mapState.layers.overlay.id) {
        changeLayer("overlay", bestNewLayer);
        mapState.layerChangePopup = true;
        setTimeout(() => {
          mapState.layerChangePopup = false;
        }, 5000);
      }
    }
  }

  function enableAnnotationMode() {
    mapState.annotationMode = true;
    map.addLayer(annotationDrawerLayer);
    annotationDrawer = new Draw({
      source: annotationDrawerGeometrySource,
      type: "Circle",
      geometryFunction: createBox(),
    });

    annotationDrawer.on("drawend", (e) => {
      annotationExtentCoords = e.feature.getGeometry().getExtent();
      annotationEntryCoords = [e.target.downPx_[0], e.target.downPx_[1]];
      mapState.annotationEntry = true;
      map.removeInteraction(annotationDrawer);
    });
    map.addInteraction(annotationDrawer);
  }

  function disableAnnotationMode() {
    map.removeInteraction(annotationDrawer);
    mapState.annotationMode = false;
    mapState.annotationEntry = false;
    annotationDrawerGeometrySource.clear();
    map.removeLayer(annotationDrawerLayer);
  }

  function cancelAnnotation() {
    map.addInteraction(annotationDrawer);
    mapState.annotationEntry = false;
    annotationDrawerGeometrySource.clear();
  }

  function loadAnnotations() {
    loadedAnnotationsList = [];
    getAnnotationsWithinExtent(view.calculateExtent()).then((d) => {
      console.log(d)
      d.forEach((x) => {
        getSingleAnnotation(x.id).then((annotation) => {
          loadedAnnotationsList = [...loadedAnnotationsList, annotation];
        });
      });
    });
  }

  function moveMapToAnnotation(d) {
    const selectedAnnotation = loadedAnnotationsList[d.detail.annotationIndex];
    const extentJson = JSON.parse(selectedAnnotation.extent)
    loadedAnnotationsGeometrySource.clear();
    loadedAnnotationsGeometrySource.addFeature(
      new Feature(fromExtent(extentJson))
    );
    changeMapView({ overlay: selectedAnnotation.layer });

    view.fit(extentJson, {
      padding: [100, 100, 300, 100],
      duration: 1000,
      maxZoom: 19,
    });
  }

  function refreshAnnotationListLength() {
  }

  // We wait to initialize the main `map` object until the Svelte module has mounted, otherwise we won't have a sized element in the DOM onto which to bind it
  onMount(() => {
    changeLayer(
      "base",
      urlParams.view && urlParams.base
        ? urlParams.base
        : instanceVariables.defaultStartLocation.baseLayerId
    );
    changeLayer(
      "overlay",
      urlParams.view && urlParams.overlay
        ? urlParams.overlay
        : instanceVariables.defaultStartLocation.overlayLayerId
    );

    map = new Map({
      target: "map-div",
      controls: [],
      view: view,
      layers: [
        mapState.layers.base.olLayer,
        mapState.layers.overlay.olLayer,
        loadedAnnotationsLayer,
        markerLayer,
      ],
    });

    // This is the function that executes the rendering of the spyglass, swipe, or opacity feature for the overlay layer
    // It's bound to the `prerender` event on `overlayLayer`
    mapState.layers.overlay.olLayer.on("prerender", function (event) {
      if (mapState.viewMode === "opacity") {
        mapState.layers.overlay.olLayer.setOpacity(opacitySliderValue / 100);
      } else {
        mapState.layers.overlay.olLayer.setOpacity(1);
        const ctx = event.context;

        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";

        if (mapState.viewMode === "swipe-y") {
          ctx.rect(
            0,
            0,
            ctx.canvas.width,
            (dragXY[1] + dragAdjuster) * pixelRatio
          );
        } else if (mapState.viewMode === "swipe-x") {
          ctx.rect(
            0,
            0,
            (dragXY[0] + dragAdjuster) * pixelRatio,
            ctx.canvas.height
          );
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
                    2
                  ) +
                    Math.pow(
                      (dragXY[1] + dragAdjuster - window.innerHeight / 2) *
                        pixelRatio,
                      2
                    )
                )
              )
            ),
            0,
            2 * Math.PI
          );
        } else ctx.fillStyle = "rgba(10,10,10,0.85)";
        ctx.fill();

        ctx.stroke();
        ctx.clip();
      }
    });

    // after rendering the layer, restore the canvas context
    mapState.layers.overlay.olLayer.on("postrender", function (event) {
      var ctx = event.context;
      ctx.restore();
    });

    map.on("moveend", mapMoved);
    mapMoved();
    mapState.mounted = true;
  });

  let draggingFlag = false;
  let dragXY = [window.innerWidth / 4, window.innerHeight / 4];
  const dragAdjuster = 14;

  function manipulateDrag(e) {
    if (draggingFlag) {
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
    }
    map.render();
  }
</script>

<section
  id="map"
  on:mousemove={manipulateDrag}
  on:touchmove={manipulateDrag}
  on:mouseup={() => {
    draggingFlag = false;
  }}
  on:touchend={() => {
    draggingFlag = false;
  }}
>
  <div id="map-div" />

  <div
    id="drag-handle"
    class="select-none cursor-move rounded-full bg-pink-800 ring-2 ring-white p-2 text-white drop-shadow hover:ring-4 hover:bg-pink-900 transition {mapState.viewMode ===
    'opacity'
      ? 'hidden'
      : ''}"
    style="left: {dragXY[0]}px; top: {dragXY[1]}px"
    on:mousedown={() => {
      draggingFlag = true;
    }}
    on:touchstart={() => {
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
      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-900"
    />
    <div class="text-sm font-semibold">Opacity {opacitySliderValue}%</div>
  </div>

  <div
    on:click={() => {
      $appState.tour.active = false;
      $appState.modals.splash = true;
    }}
    class="absolute top-0 w-24 left-5 bg-white p-2 rounded-b-lg cursor-pointer transition-all drop-shadow hover:pt-3"
  >
    <AtlascopeLogo />
  </div>

  {#if $appState.modals.geolocation}
    <div
      class="absolute top-5 right-5 max-w-sm bg-slate-100 py-3 px-4 rounded shadow"
    >
      <GeolocationModal
        on:goToCoords={(e) => {
          changeMapView({
            center: [e.detail.lon, e.detail.lat],
            duration: 300,
            dropMarkerAtPoint: true,
          });
        }}
      />
    </div>
  {/if}

  {#if mapState.annotationMode}
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
        on:click={disableAnnotationMode}
        icon={faStopCircle}
        label="Stop annotating"
        size="sm"
      />
    </div>
  {/if}

  {#if mapState.annotationMode && mapState.annotationEntry}
    <AnnotationEntryForm
      pos={annotationEntryCoords}
      featureExtent={annotationExtentCoords}
      layerID={mapState.layers.overlay.id}
      layerName={mapState.layers.overlay.properties.fallbackTitle
        ? mapState.layers.overlay.properties.fallbackTitle
        : mapState.layers.overlay.properties.year}
      on:cancel={cancelAnnotation}
    />
  {/if}

  {#if loadedAnnotationsList.length > 0}
    <AnnotationsListModal
      annotationsList={loadedAnnotationsList}
      on:moveMapToAnnotation={moveMapToAnnotation}
      on:closeAnnotationListModal={() => {
        loadedAnnotationsGeometrySource.clear();
        loadedAnnotationsList = [];
      }}
      on:refreshAnnotations={loadAnnotations}
    />
  {/if}

  {#if !mapState.annotationMode && loadedAnnotationsList.length === 0 && !$appState.tour.active}
    <MapControls
      {mapState}
      on:changeLayer={(d) => {
        changeLayer(d.detail.layer, d.detail.id);
      }}
      on:changeMode={(d) => {
        changeMode(d.detail.id);
      }}
      on:zoomIn={() => {
        view.animate({ zoom: view.getZoom() + 1, duration: 500 });
      }}
      on:zoomOut={() => {
        view.animate({ zoom: view.getZoom() - 1, duration: 500 });
      }}
      on:rotate={() => {
        view.animate({
          rotation: view.getRotation() + (2 * Math.PI) / 6,
          duration: 500,
        });
      }}
      on:enableAnnotationMode={enableAnnotationMode}
      on:loadAnnotations={loadAnnotations}
    />
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

  #drag-handle {
    position: absolute;
  }
</style>
