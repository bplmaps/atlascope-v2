<script>
  import { onMount } from "svelte";

  import instanceVariables from "./config/instance.json";

  import "@fontsource-variable/inter";
  import "./style/global.css";

  import {
    parseUrlParams,
    fetchLayerData,
  } from "./lib/helpers/initializingFunctions.js";

  import Map from "./lib/Map.svelte";
  import ModalWrapper from "./lib/modals/ModalWrapper.svelte";
  import TourController from "./lib/tours/TourController.svelte";

  import GoogleAnalytics from "./lib/helpers/GoogleAnalytics.svelte";

  import { mapState, appState, allLayers } from "./lib/state.svelte.js";

  // Initialization functions; parse out the initial url params and fetch the layer data
  onMount(() => {
    const urlParams = parseUrlParams(
      window.location.hash.substring(2).split("?")[0],
    );
    mapState.viewMode = urlParams.mode ? urlParams.mode : "glass";
    mapState.center = urlParams.center
      ? urlParams.center.split(",")
      : instanceVariables.defaultStartLocation.center;
    mapState.zoom = urlParams.zoom
      ? urlParams.zoom
      : instanceVariables.defaultStartLocation.zoom;
    mapState.layers.base.id = urlParams.base
      ? urlParams.base
      : instanceVariables.defaultStartLocation.baseLayerId;
    mapState.layers.overlay.id = urlParams.overlay
      ? urlParams.overlay
      : instanceVariables.defaultStartLocation.overlayLayerId;

    fetchLayerData().then((d) => {
      allLayers.layers = d;
      appState.layersLoaded = true;

      // If the url params are set to a share link or tour, close all modals and start a tour
      if (urlParams.view && urlParams.view === "share") {
        appState.modals.splash = false;
      } else if (urlParams.view && urlParams.view === "tour") {
        appState.tour.id = urlParams.tour;
        appState.tour.active = true;
        appState.modals.splash = false;
      }
    });
  });
</script>

<svelte:head>
  <title
    >Atlascope {instanceVariables.name} · {instanceVariables.institutionalShortName}</title
  >
</svelte:head>

<GoogleAnalytics gaPropertyId={instanceVariables.gaMeasurementId} gaTMContainerId={instanceVariables.gaTMContainerId} />

<div id="wraps-all">
  {#if appState.layersLoaded}
    <Map />
  {/if}

  {#if appState.tour.active}
    <TourController />
  {/if}

  {#if appState.modals.splash || appState.modals.search || appState.modals.biblio || appState.modals.tourList}
    <ModalWrapper />
  {/if}
</div>

<style>
  :global(body) {
    font-family: "Inter Variable", sans-serif;
    overflow: hidden;
  }

  :global(body) {
    max-width: 100%;
    max-height: 100%;
  }

  #wraps-all {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 0;
    background-color: #222;
    overflow: auto;
  }
</style>
