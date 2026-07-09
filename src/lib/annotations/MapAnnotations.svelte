<script>
  import { onMount } from "svelte";

  import Fa from "svelte-fa";
  import { faPenToSquare, faStopCircle } from "@fortawesome/free-solid-svg-icons";

  import LightIconButton from "../ui/LightIconButton.svelte";
  import AnnotationEntryForm from "./AnnotationEntryForm.svelte";
  import AnnotationsListModal from "./AnnotationsListModal.svelte";

  import { mapState, appState } from "../state.svelte.js";
  import { createAnnotationManager } from "../map/annotationManager.js";

  // Owns the user-annotation feature's map wiring and UI. Rendered inside
  // Map.svelte's <section> (so the absolute-positioned blocks anchor to the
  // map) and only after the OL map has mounted, so getMap()/getView() are
  // always live.
  let { getMap, getView, changeLayer } = $props();

  let loadedAnnotationsList = $state([]);
  let annotationEntryCoords = $state([0, 0]);
  let annotationExtentCoords = $state(null);

  const annotations = createAnnotationManager({
    getMap: () => getMap(),
    getView: () => getView(),
    changeLayer: (...args) => changeLayer(...args),
    onDrawEnd: (extent, pixel) => {
      annotationExtentCoords = extent;
      annotationEntryCoords = pixel;
    },
  });

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

  onMount(() => {
    // Insert the loaded-annotations layer between the overlay tile layer
    // and the marker layer (index 3), the same stacking position it had
    // when constructed inline with the map
    getMap().getLayers().insertAt(3, annotations.loadedLayer);
    return () => {
      getMap()?.removeLayer(annotations.loadedLayer);
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

  // MapControls visibility (gated in Map.svelte) needs to know whether the
  // annotations list is showing now that its state lives here
  $effect(() => {
    mapState.annotationsListShowing = loadedAnnotationsList.length > 0;
  });

  // Reopening the splash (via the logo) dismisses any loaded annotations;
  // this was previously done directly in the logo's click handler
  $effect(() => {
    if (appState.modals.splash && loadedAnnotationsList.length > 0) {
      closeAnnotationListModal();
    }
  });
</script>

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
