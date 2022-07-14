<script>
  import Fa from "svelte-fa";
  import {
    faDraftingCompass,
    faLayerGroup,
    faAngleUp,
    faArrowsAltV,
    faArrowsAltH,
    faBorderStyle,
    faCircle,
    faMagnifyingGlassArrowRight,
faExclamationCircle,
  } from "@fortawesome/free-solid-svg-icons";

  import { allLayers } from "./stores.js";

  let controlGroups = [
    { id: "map-controls", name: "Controls", icon: faDraftingCompass },
    { id: "layer-controls", name: "Atlases", icon: faLayerGroup },
    { id: "research-controls", name: "Research", icon: faMagnifyingGlassArrowRight}
  ];

  let panelShown = null;

  const showHideControls = (e) => {
    panelShown = panelShown === e ? null : e;
  };

</script>

<section>
  {#if $allLayers.filter((layer) => layer.extentVisible > 0.1).length === 0 }
    <div class="w-2/3 mx-auto bg-orange-100/90 text-rose-900 py-2 px-5 rounded drop-shadow mb-4 font-semibold text-center">
      <Fa icon={faExclamationCircle} class="inline mr-0.5" /> You're looking at a location where no historic atlas layers are currently available.
      <p class="font-light text-sm"><a href="">Learn more about our plans for adding coverage to Atlascope.</a></p>
    </div>
  {/if}

  {#each controlGroups as cg}
    <div
      class="control-tab mr-2"
      on:click={()=>{showHideControls(cg.id)}}
    >
      <Fa icon={cg.icon} class="inline mr-2" />
      {#if cg.id === "layer-controls"}
      <span class="bg-green-800 text-gray-200 text-s mr-1 px-1.5 py-0.5 rounded">{$allLayers.filter((layer) => layer.extentVisible > 0.1).length}</span>
      {/if}
      <span class="hidden md:inline control-tab-label">{cg.name}</span>
    </div>
  {/each}

  {#if panelShown === 'map-controls'}
    <div class="control-panel">
      Map controls here
    </div>
  {:else if panelShown === 'layer-controls'}
  <div class="control-panel">
    Layer controls here
  </div>
  {:else if panelShown === 'research-controls'}
  <div class="control-panel">
    Research controls here
  </div>

  {/if}
</section>

<style>
  section {
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 50px;
  }

  .control-tab {
    display: inline-block;
    background-color: rgba(255, 255, 255, 0.97);
    padding: 10px 20px;
    font-weight: 650;
    cursor: pointer;
    border-radius: 5px 5px 0 0;
    transition: color 0.5s, background-color 0.5s;
  }

  .control-tab:hover {
    background-color: rgb(212, 213, 219);
  }

  .control-panel {
    padding: 30px;
    background-color: rgba(255, 255, 255, 0.97);
  }
</style>
