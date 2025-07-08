<script>
  import { onMount } from "svelte";

  import instanceVariables from "./config/instance.json";
  import "./style/global.css";

  import {
    parseUrlParams,
    fetchLayerData,
  } from "./lib/helpers/initializingFunctions.js";

  import Map from "./lib/Map.svelte";
  import ModalWrapper from "./lib/modals/ModalWrapper.svelte";

  import SearchModalMaptiler from "./lib/SearchModalMaptiler.svelte";
  import BibliographicInfoModal from "./lib/BibliographicInfoModal.svelte";
  import TourListModal from "./lib/TourListModal.svelte";
  import TourController from "./lib/TourController.svelte";
  import AboutModal from "./lib/AboutModal.svelte";
  import GoogleAnalytics from "./lib/helpers/GoogleAnalytics.svelte";

  import { mapState, appState, allLayers } from "./lib/state.svelte.js";

  let changeMapView;

  function handleSplashButton(m) {
    closeAllModals();

    if (m.detail.action === "start") {
      changeMapView({
        center: instanceVariables.defaultStartLocation.center,
        zoom: instanceVariables.defaultStartLocation.zoom,
      });
    } else if (m.detail.action === "jumpToCoverageLocation") {
      changeMapView({
        center: m.detail.center,
        zoom: 17.5,
      });
    } else if (m.detail.action === "search") {
      appState.modals.search = true;
    } else if (m.detail.action === "find") {
      appState.modals.geolocation = true;
    } else if (m.detail.action === "tour") {
      appState.modals.tourList = true;
    } else if (m.detail.action === "about") {
      appState.modals.about = true;
    }
  }

  function closeAllModals() {
    Object.keys(appState.modals).forEach((key) => {
      appState.modals[key] = false;
    });
    appState.tour.active = false;
  }

  function startTour(m) {
    closeAllModals();
    appState.tour.id = m.detail.id;
    appState.tour.active = true;
  }

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
    });

    // If the url params are set to a view, close all modals and start a tour
    if (urlParams.view && urlParams.view === "share") {
      closeAllModals();
    } else if (urlParams.view && urlParams.view === "tour") {
      startTour({ detail: { id: urlParams.tour } });
    }
  });
</script>

<svelte:head>
  <title
    >Atlascope {instanceVariables.name} · {instanceVariables.institutionalShortName}</title
  >
</svelte:head>

<GoogleAnalytics gaPropertyId={instanceVariables.gaMeasurementId} />

<div id="wraps-all">
  {#if appState.layersLoaded}
    <Map />
  {/if}

  <ModalWrapper />
<!-- 
  {#if appState.modals.search}
    <SearchModalMaptiler
      goToCoords={(d) => {
        console.log(d);
        closeAllModals();
        changeMapView({
          center: [d.lon, d.lat],
          zoom: 19,
          dropMarkerAtPoint: true,
        });
      }}
      closeSelf={() => {
        appState.modals.search = false;
      }}
    />
  {:else if appState.modals.tourList}
    <TourListModal
      on:closeSelf={() => {
        appState.modals.tourList = false;
      }}
      on:startTour={startTour}
    />
  {:else if appState.modals.biblio}
    <BibliographicInfoModal
      on:closeSelf={() => {
        appState.modals.biblio = false;
      }}
      base={mapState.layers.base.properties}
      overlay={mapState.layers.overlay.properties}
    />
  {:else if appState.modals.about}
    <AboutModal
      on:closeSelf={() => {
        appState.modals.about = false;
      }}
    />
  {:else if appState.modals.splash}
    <Splash
      on:splashButton={handleSplashButton}
      on:closeSelf={() => {
        appState.modals.splash = false;
      }}
    />
  {/if}

  {#if appState.tour.active}
    <TourController
      tourId={appState.tour.id}
      {changeMapView}
      on:leaveTour={closeAllModals}
    />
  {/if} -->

</div>

<style>
  @import url("https://rsms.me/inter/inter.css");

  :global(body) {
    font-family: "Inter", sans-serif;
    overflow: hidden;
  }

  :global(body) {
    max-width: 100%;
    max-height: 100%;
  }

  @supports (font-variation-settings: normal) {
    :global(body) {
      font-family: "Inter var", sans-serif;
    }
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
