<script>
  import { onMount } from "svelte";
  import instanceVariables from "./config/instance.json";
  import "./style/global.css";

  import Map from "./lib/Map.svelte";
  import Splash from "./lib/Splash.svelte";
  import SearchModal from "./lib/SearchModal.svelte";

  import { allLayers } from "./lib/stores.js";

  let state = {
    layersLoaded: false,
    splashActive: true,
    searchActive: false
  };

  let map;

  function handleSplashButton(m) {
    state.splashActive = false;

    if (m.detail.action === "start") {
      map.changeCenterZoom(
        instanceVariables.defaultStartLocation.center,
        instanceVariables.defaultStartLocation.zoom
      );
    } 
    else if (m.detail.action === "search") {
      state.searchActive = true;
    }
  }

  function goToCoords(d) {
    state.splashActive = false;
    state.searchActive = false;
    map.goToCoords(d.detail.lon, d.detail.lat);
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
          return a.properties.year - b.properties.year;
        });
        allLayers.set(al);
        state.layersLoaded = true;
        
      })
      .catch();

  });
</script>

<div id="wraps-all">
  {#if state.layersLoaded }
  <Map
    bind:this={map}
    defaultStartLocation={instanceVariables.defaultStartLocation}
  />
  {/if}

  {#if state.searchActive}
    <SearchModal on:goToCoords={goToCoords} />
  {/if}

  {#if state.splashActive}
    <Splash {instanceVariables} on:splashButton={handleSplashButton} state="{state}" />
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
