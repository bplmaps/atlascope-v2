<script>
  import { onMount } from "svelte";
  import instanceVariables from "./config/instance.json";
  import "./style/global.css";
  import * as topojson from "topojson-client";

  import Map from "./lib/Map.svelte";
  import Splash from "./lib/Splash.svelte";
  import SearchModal from "./lib/SearchModal.svelte";
  import BibliographicInfoModal from "./lib/BibliographicInfoModal.svelte";
  import TourListModal from "./lib/TourListModal.svelte";
  import TourController from "./lib/TourController.svelte";
  import AboutModal from "./lib/AboutModal.svelte";

  import { GoogleAnalytics } from "@beyonk/svelte-google-analytics";

  import { allLayers } from "./lib/stores.js";
  import { appState } from "./lib/stores.js";
  import url from "./lib/helpers/urlRouter.js";

  let changeMapView;
  let mapState;

  let urlParams = {};
  let pageTitle = `Atlascope ${instanceVariables.name} · ${instanceVariables.institutionalShortName}`
  let pageDescription = `Atlascope ${instanceVariables.name} ${instanceVariables.description}`

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
      $appState.modals.search = true;
    } else if (m.detail.action === "find") {
      $appState.modals.geolocation = true;
    } else if (m.detail.action === "tour") {
      $appState.modals.tourList = true;
    } else if (m.detail.action === "about") {
      $appState.modals.about = true;
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
    $appState.tour.id = m.detail.id;
    $appState.tour.active = true;
  }

  // When the app is mounted, first thing we need to do is load the footprints file
  // We stort it by year and then write it to the `allLayers` store which can be accessed
  // from any module
  onMount(() => {
    $url.hash
      .substring(2)
      .split("$")
      .map((kv) => {
        const i = kv.indexOf(":");
        const k = kv.slice(0, i);
        const v = kv.slice(i + 1);
        urlParams[k] = v;
      });

    fetch(instanceVariables.historicLayersFootprintsFile, { cache: "reload" })
      .then((r) => r.json())
      .then((d) => {
        let al = topojson.feature(d, "boston-volume-extents").features;
        al.sort((a, b) => {
          return +a.properties.year - b.properties.year;
        });
        allLayers.set(al);
        $appState.layersLoaded = true;
      })
      .then(() => {
        if (urlParams.view && urlParams.view === "share") {
          closeAllModals();
        } else if (urlParams.view && urlParams.view === "tour") {
          startTour({ detail: { "id": urlParams.tour } });
        }
      })
      .catch(() => {
        window.alert(
          "Unable to load map data. Check your internet connection and try reloading the page."
        );
      });
  });

  // Google Tag Manager script
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',`${instanceVariables.gaTMContainerId}`);

</script>

<svelte:head>
  <title>Atlascope {instanceVariables.name} · {instanceVariables.institutionalShortName}</title>
</svelte:head>

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id`${instanceVariables.gaTMContainerId}`"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->

<div id="wraps-all">
  {#if $appState.layersLoaded}
    <Map {urlParams} bind:changeMapView bind:mapState />
  {/if}

  {#if $appState.modals.search}
    <SearchModal
      on:goToCoords={(d) => {
        closeAllModals();
        changeMapView({
          center: [d.detail.lon, d.detail.lat],
          zoom: 19,
          dropMarkerAtPoint: true,
        });
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
  {:else if $appState.modals.about}
    <AboutModal
      on:closeSelf={() => {
        $appState.modals.about = false;
      }}
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

  <GoogleAnalytics properties={[instanceVariables.gaMeasurementId]} />


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
