<script>
  import { onMount } from "svelte";
  import instanceVariables from "./config/instance.json";
  import "./style/global.css";

  import Map from "./lib/Map.svelte";
  import Splash from "./lib/Splash.svelte";
  import SearchModal from "./lib/SearchModal.svelte";
  import BibliographicInfoModal from "./lib/BibliographicInfoModal.svelte";
  import TourListModal from "./lib/TourListModal.svelte";
  import TourController from "./lib/TourController.svelte";

  import { allLayers } from "./lib/stores.js";
  import { appState } from "./lib/stores.js";

  let changeMapView;
  let mapState;

  function handleSplashButton(m) {
    closeAllModals();

    if (m.detail.action === "start") {
      changeMapView({
        center: instanceVariables.defaultStartLocation.center,
        zoom: instanceVariables.defaultStartLocation.zoom,
      });
    } else if (m.detail.action === "search") {
      $appState.modals.search = true;
    } else if (m.detail.action === "find") {
      $appState.modals.geolocation = true;
    } else if (m.detail.action === "tour") {
      $appState.modals.tourList = true;
    }
  }

  function closeAllModals() {
    Object.keys($appState.modals).forEach((key) => {
      $appState.modals[key] = false;
    });
    $appState.tour.active = false;
  }

  function startTour(m) {
    closeAllModals();
    $appState.tour.id = m.detail.tourId;
    $appState.tour.active = true;
  }

  // When the app is mounted, first thing we need to do is load the footprints file
  // We stort it by year and then write it to the `allLayers` store which can be accessed
  // from any module
  onMount(() => {
    fetch(instanceVariables.historicLayersFootprintsFile)
      .then((r) => r.json())
      .then((d) => {
        let al = d.features;
        al.sort((a, b) => {
          return +a.properties.year - b.properties.year;
        });
        allLayers.set(al);
        $appState.layersLoaded = true;
      })
      .catch(() => {
        window.alert(
          "Unable to load map data. Check your internet connection and try reloading the page."
        );
      });
  });
</script>

<svelte:head>
  <title>Atlascope {instanceVariables.name} · v2 development</title>
</svelte:head>

<div id="wraps-all">
  {#if $appState.layersLoaded}
    <Map bind:changeMapView bind:mapState />
  {/if}

  {#if $appState.modals.search}
    <SearchModal
      on:goToCoords={(d) => {
        closeAllModals();
        changeMapView({ center: [d.detail.lon, d.detail.lat], zoom: 19 });
      }}
      on:closeSelf={() => {
        $appState.modals.search = false;
      }}
    />
  {:else if $appState.modals.tourList}
    <TourListModal
      on:closeSelf={() => {
        $appState.modals.tourList = false;
      }}
      on:startTour={startTour}
    />
  {:else if $appState.modals.biblio}
    <BibliographicInfoModal
      on:closeSelf={() => {
        $appState.modals.biblio = false;
      }}
      base={mapState.layers.base.properties}
      overlay={mapState.layers.overlay.properties}
    />
  {:else if $appState.modals.splash}
    <Splash
      on:splashButton={handleSplashButton}
      on:closeSelf={() => {
        $appState.modals.splash = false;
      }}
    />
  {/if}

  {#if $appState.tour.active}
    <TourController
      tourId={$appState.tour.id}
      {changeMapView}
      on:leaveTour={closeAllModals}
    />
  {/if}
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
