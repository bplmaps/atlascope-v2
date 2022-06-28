<script>

  import {onMount} from 'svelte';
  import instanceVariables from './config/instance.json';
  import './style/global.css';

  import Map from './lib/Map.svelte'
  import Splash from './lib/Splash.svelte'

  import { availableLayerCount } from './lib/stores.js';

  import {intersector} from './lib/helpers/intersector';

  let allLayers = [];

  let state = {
    "splashActive": true,
    "activeLayers": {
      "base": null,
      "overlay": null
    }
  }

  let map;

  function handleSplashButton(action) {
    state.splashActive = false;
  }

  const startAtDefault = () => {
    map.changeCenterZoom(instanceVariables.defaultStartLocation.center, instanceVariables.defaultStartLocation.zoom);
    state.primary = "map";
  }

  function handleChangedExtent(e) {
    allLayers.forEach((layer)=>{ 
      let vis = intersector(layer.geometry, e.detail.extent)
      layer.extentVisible = vis; 
     });

    const c = allLayers.filter(layer => layer.extentVisible > 0.1).length;
    availableLayerCount.set(c);
  };


  const goToMap = () => {
    state.primary = "map";
  }

  onMount(() => {
    fetch(instanceVariables.historicLayersFootprintsFile)
      .then(r => r.json())
      .then(d => { 
          allLayers = d.features;
          allLayers.sort((a,b)=>{return a.properties.year - b.properties.year});
       })
      .catch();
  });


</script>

<style>
  @import url('https://rsms.me/inter/inter.css');

  :global(body) {
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
    margin: 0;
    padding: 0;
    background-color: #222;
    overflow: auto;
  }


</style>

<div id="wraps-all">

  <Map bind:this={map} initialCenter={instanceVariables.defaultStartLocation.center} initialZoom={instanceVariables.defaultStartLocation.zoom} on:changedExtent={handleChangedExtent} />

  {#if state.splashActive}
  <Splash instanceVariables={instanceVariables} availableLayers={allLayers.length} on:splashButton={handleSplashButton} />
  {/if}


</div>
