<script>
  import Fa from "svelte-fa";
  import {
    faLayerGroup,
    faMagnifyingGlassArrowRight,
    faExclamationCircle,
    faLocationArrow,
    faSearchLocation,
    faShare,
    faCopy,
    faPlus,
    faMinus,
    faRotateRight,
    faBookBookmark,
    faMap,
    faMapPin,
    faPenToSquare,
    faMobileAlt,
    faStreetView,
  } from "@fortawesome/free-solid-svg-icons";

  import { appState,mapState, allLayers } from "../state.svelte.js";

  import ViewModeDropupMenu from "./ViewModeDropupMenu.svelte";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import ShareControls from "./ShareControls.svelte";
  import MapControls from "./MapControls.svelte";
  import LayerControls from "./LayerControls.svelte";

  import instanceVariables from "../../config/instance.json";

  import { bboxFunctions } from "../../config/research-connections.js";

  let controlGroups = [
    { id: "map-controls", name: "Controls", icon: faMap },
    { id: "layer-controls", name: "Atlases", icon: faLayerGroup },
    {
      id: "research-controls",
      name: "Research",
      icon: faMagnifyingGlassArrowRight,
    },
    { id: "share-controls", name: "Share", icon: faShare },
  ];

  let panelShown = $state(null);

  const showHideControls = (e) => {
    panelShown = panelShown === e ? null : e;
  };
</script>

<section>
  {#if allLayers.layers.filter((layer) => layer.extentVisible > 0.2).length === 0}
    <div
      class="w-2/3 mx-auto bg-orange-100/90 text-rose-900 py-2 px-5 rounded drop-shadow mb-4 font-semibold text-center"
    >
      <Fa icon={faExclamationCircle} class="inline mr-0.5" /> You're looking at a
      location where no historic atlas layers are currently available.
      <p class="font-light text-sm">
        <a
          href={instanceVariables.outOfBoundsMessage.url}
          target="_blank"
          rel="noreferrer">{instanceVariables.outOfBoundsMessage.text}</a
        >
      </p>
    </div>
  {/if}

  {#if mapState.layerChangePopup}
    <div
      class="w-2/3 mx-auto bg-orange-100/90 text-rose-900 py-2 px-5 rounded drop-shadow mb-4 font-semibold text-center"
    >
      <Fa icon={faExclamationCircle} class="inline mr-0.5" /> You moved off the edge
      of the previous atlas.
      <p class="font-light text-sm">
        We automatically pulled up a new layer, <strong
          >{mapState.layers.overlay.properties.fallbackTitle
            ? mapState.layers.overlay.properties.fallbackTitle
            : mapState.layers.overlay.properties.year}
          {mapState.layers.overlay.properties.fallbackSubtitle
            ? mapState.layers.overlay.properties.fallbackSubtitle
            : mapState.layers.overlay.properties.publisherShort}</strong
        >
      </p>
    </div>
  {/if}

  {#each controlGroups as cg}
    <div
      class="control-tab mr-2 select-none"
      class:control-tab-active={cg.id === panelShown}
      on:click={() => {
        showHideControls(cg.id);
      }}
    >
      <Fa icon={cg.icon} class="inline" />
      {#if cg.id === "layer-controls"}
        <span
          class="bg-green-800 text-gray-200 text-s ml-2 mr-1 px-1.5 py-0.5 rounded"
          >{allLayers.layers.filter((layer) => layer.extentVisible > 0.2).length}</span
        >
      {/if}
      <span class="hidden md:inline control-tab-label">{cg.name}</span>
    </div>
  {/each}

  <div class="bg-white p-4 {panelShown ? 'block' : 'hidden'}">
    {#if panelShown === "map-controls"}
      <MapControls />
    {:else if panelShown === "layer-controls"}
      <LayerControls />
    {:else if panelShown === "research-controls"}
      <h2 class="md:hidden text-xl font-bold mb-2">Research</h2>
      <div class="flex flex-wrap">
        <LightIconButton
          label="Annotate map"
          icon={faPenToSquare}
          on:click={() => {
            dispatch("enableAnnotationMode");
          }}
        />
        <LightIconButton
          label="Load annotations"
          icon={faMapPin}
          on:click={() => {
            dispatch("loadAnnotations");
          }}
        />

        {#each bboxFunctions as f}
          <LightIconButton
            label={f.name}
            icon={faMagnifyingGlassArrowRight}
            on:click={() => {
              let url = f.searchFunction(mapState.extent);
              window.open(url);
            }}
          />
        {/each}
      </div>
    {:else if panelShown === "share-controls"}
      <h2 class="md:hidden text-xl font-bold mb-2">Share</h2>
      <div class="control-panel">
        <ShareControls />
      </div>
    {/if}
  </div>
</section>

<style>
  section {
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
  }

  .control-tab {
    display: inline-block;
    background-color: rgba(252, 252, 240, 0.899);
    padding: 10px 20px;
    font-weight: 650;
    cursor: pointer;
    border-radius: 5px 5px 0 0;
    transition:
      color 0.5s,
      background-color 0.5s;
  }

  .control-tab:hover {
    background-color: rgba(255, 255, 255, 0.97);
  }

  .control-tab-active {
    background-color: rgba(255, 255, 255, 0.97);
  }
</style>
