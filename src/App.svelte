<script>

  import {onMount} from 'svelte';
  import instanceVariables from './config/instance.json';
  import './style/global.css';

  import Map from './lib/Map.svelte'
  import Controls from './lib/Controls.svelte'

  import {intersector} from './lib/helpers/intersector';

  import Fa from 'svelte-fa';
  import { faLocationArrow, faSearchLocation, faHiking, faLandmark } from '@fortawesome/free-solid-svg-icons';

  let layersLoaded = false;
  let allLayers = [];
  let validLayers = [];

  let state = {
    "primary": "splash",
    "activeLayers": {
      "base": null,
      "overlay": null
    }
  }

  let map;

  const startAtDefault = () => {
    map.changeCenterZoom(instanceVariables.defaultStartLocation.center, instanceVariables.defaultStartLocation.zoom);
    state.primary = "map";
  }

  const handleChangedExtent = (event) => {
    validLayers = []
    allLayers.forEach((layer)=>{ 
      let vis = intersector(layer.geometry, event.detail.extent)
      if(vis > 0) { validLayers.push({"layer": layer, "vis": vis}); }
     });

     console.log(validLayers[0]);
     map.mapLayers.base.setSource()

  };


  const goToMap = () => {
    state.primary = "map";
  }

  onMount(() => {
    fetch(instanceVariables.historicLayersFootprintsFile)
      .then(r => r.json())
      .then(d => { 
          layersLoaded = true;
          allLayers = d.features;
          allLayers.sort((a,b)=>{return a.properties.year - b.properties.year});
       })
      .catch();
  });
</script>

<style>
  @import url('https://rsms.me/inter/inter.css');

  :global(body) {
    /* margin: 0; */
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  :global(body) {
    max-width: 100%;
    max-height: 100%;
  }

  @supports (font-variation-settings: normal) {
  :global(body) { font-family: 'Inter var', sans-serif; }
  }

  #wraps-all {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #222;
    overflow: auto;
  }
  
  .ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 0;
    overflow: auto;
  }

  #ui-layer-splash {
    background-color: rgba(255,255,255,0.93);
  }

  #splash-inner {
    padding: 30px; 
    text-align: center;
  }

  .teaser {
    font-weight: 800;
  }

</style>

<div id="wraps-all">

  <div class="ui-layer">
    <Map bind:this={map} initialCenter={instanceVariables.defaultStartLocation.center} initialZoom={instanceVariables.defaultStartLocation.zoom} on:changedExtent={handleChangedExtent} />
  </div>

  <div>
    <Controls {validLayers} />
  </div>

  {#if state.primary === "splash"}
  <div class="ui-layer" id="ui-layer-splash">
    <div id="splash-inner">
      <p class="is-size-5 has-text-weight-semibold tagline"><strong class="has-background-primary has-text-white-ter p-1">Atlascope {instanceVariables.name}</strong> {instanceVariables.tagline}</p>
      <p class="is-size-3 my-4 teaser">How do you want to start exploring?</p>

      <div class="my-5">
      <button class="button is-primary is-outlined" disabled={!layersLoaded} on:click={() => { map.changeView("x","y"); }}><Fa icon={faLocationArrow} class="mr-2" />Find my location</button>
      <button class="button is-primary is-outlined" disabled={!layersLoaded} on:click={goToMap}><Fa icon={faSearchLocation} class="mr-2" />Search places</button>
      <button class="button is-primary is-outlined" disabled={!layersLoaded} on:click={goToMap}><Fa icon={faHiking} class="mr-2" />Take a tour</button>
      <button class="button is-primary is-outlined" disabled={!layersLoaded} on:click={startAtDefault}><Fa icon={faLandmark} class="mr-2" />Start at {instanceVariables.defaultStartLocation.name}</button>
      </div>

      <div>
        <p class="has-text-weight-semibold">Currently serving <span class="{!layersLoaded ? 'is-loading' : ''} button is-small is-static px-1">{allLayers.length}</span> atlas layers of {instanceVariables.geographicCoverage}</p>
      </div>
    </div>
  </div>
  {/if}

</div>
