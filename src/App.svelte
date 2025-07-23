<script>
  import { onMount } from "svelte";
  import instanceVariables from "./config/instance.json";
  import "./style/global.css";

  import Map from "./lib/Map.svelte";
  import Splash from "./lib/Splash.svelte";
  import SearchModal from "./lib/SearchModal.svelte";


  import { allLayers } from "./lib/stores.js";
  import { appState } from "./lib/stores.js";
  import url from "./lib/helpers/urlRouter.js";

  let changeMapView;
  let mapState;

  let urlParams = {};

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
    $appState.tour.id = m.detail.tourId;
    $appState.tour.active = true;
  }


	let inactivityTimeout;

	const INACTIVITY_LIMIT = 2 * 60 * 1000; // 3 minutes

	function resetInactivityTimer() {
		clearTimeout(inactivityTimeout);
		inactivityTimeout = setTimeout(() => {
			location.reload(); // Full page reload
		}, INACTIVITY_LIMIT);
	}

	function startInactivityWatcher() {
		// More complete set of user activity events, including touch
		const events = [
			'mousemove',
			'mousedown',
			'keypress',
			'touchstart',
			'touchmove',
			'touchend',
			'scroll'
		];

		for (const event of events) {
			window.addEventListener(event, resetInactivityTimer, { passive: true });
		}

		resetInactivityTimer(); // Start initial timer
	}


  // When the app is mounted, first thing we need to do is load the footprints file
  // We stort it by year and then write it to the `allLayers` store which can be accessed
  // from any module
  onMount(() => {
    startInactivityWatcher();

    $url.hash.substring(2).split("$").map((kv)=>{const i = kv.indexOf(':'); const k = kv.slice(0,i); const v = kv.slice(i+1); urlParams[k]=v; });

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
      .then(()=>{
              
        if(urlParams.view && urlParams.view === "share") {
          closeAllModals();
        }

        else if(urlParams.view && urlParams.view === "tour") {
          startTour({detail: {"tourId": urlParams.tour}});
        }

      })
      .catch(() => {
        window.alert(
          "Unable to load map data. Check your internet connection and try reloading the page."
        );
      });

    return () => {
			clearTimeout(inactivityTimeout);
		};

  });
</script>

<svelte:head>
  <title>Atlascope {instanceVariables.name} · {instanceVariables.institutionalShortName}</title>
</svelte:head>

<div id="wraps-all">
  {#if $appState.layersLoaded}
    <Map urlParams={urlParams} bind:changeMapView bind:mapState />
  {:else}
  <Splash
  on:splashButton={handleSplashButton}
  on:closeSelf={() => {
    $appState.modals.splash = false;
  }}
/>

  {/if}

  {#if $appState.modals.search}
    <SearchModal
      on:goToCoords={(d) => {
        closeAllModals();
        changeMapView({ center: [d.detail.lon, d.detail.lat], zoom: 19, dropMarkerAtPoint: true });
      }}
      on:closeSelf={() => {
        $appState.modals.search = false;
      }}
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

  :global(html) {
    touch-action:none;
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
