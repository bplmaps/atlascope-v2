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

  import { mapState, allLayers } from "../state.svelte.js";

  import LayerChooserDropupMenu from "./LayerChooserDropupMenu.svelte";
  import ViewModeDropupMenu from "./ViewModeDropupMenu.svelte";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import ShareLinks from "./ShareLinks.svelte";

  import instanceVariables from "../../config/instance.json";


  import { bboxFunctions } from "../../config/research-connections";

  


  let controlGroups = [
    { id: "map-controls", name: "Controls", icon: faMap },
    { id: "layer-controls", name: "Atlases", icon: faLayerGroup },
    { id: "research-controls", name: "Research", icon: faMagnifyingGlassArrowRight },
    { id: "share-controls", name: "Share", icon: faShare },
  ];



  

  export let panelShown = null;

  $: shareURLs = {
    "app": instanceVariables.baseURL,
    "view": `${instanceVariables.baseURL}/#/view:share$mode:${mapState.viewMode}$center:${mapState.center}$zoom:${mapState.zoom}$base:${mapState
                .layers.base.id}$overlay:${mapState.layers.overlay.id}`
  }

  const showHideControls = (e) => {
    panelShown = panelShown === e ? null : e;
  };

  function handleChangeLayer(d, layer) {
    dispatch("changeLayer", { id: d.detail.id, layer: layer });
  }

  function handleChangeMode(d) {
    dispatch("changeMode", { id: d.detail.id });
  }

</script>

<section>
  {#if allLayers.filter((layer) => layer.extentVisible > 0.2).length === 0}
    <div
      class="w-2/3 mx-auto bg-orange-100/90 text-rose-900 py-2 px-5 rounded drop-shadow mb-4 font-semibold text-center"
    >
      <Fa icon={faExclamationCircle} class="inline mr-0.5" /> You're looking at a
      location where no historic atlas layers are currently available.
      <p class="font-light text-sm">
        <a href="{instanceVariables.outOfBoundsMessage.url}" target="_blank" rel="noreferrer"
          >{instanceVariables.outOfBoundsMessage.text}</a
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
          >{allLayers.filter((layer) => layer.extentVisible > 0.2)
            .length}</span
        >
      {/if}
      <span class="hidden md:inline control-tab-label">{cg.name}</span>
    </div>
  {/each}

  <div class="bg-white p-4 {panelShown ? 'block' : 'hidden'}">
    {#if panelShown === "map-controls"}
      <h2 class="md:hidden text-xl font-bold mb-2">Controls</h2>
      <div class="flex max-w-full flex-wrap">
        <div class="mr-4">
          <ViewModeDropupMenu
            chosen={mapState.viewMode}
            on:selectionMade={handleChangeMode}
          />
        </div>

        <div class="mt-1 mr-3 inline-flex rounded-md shadow-sm" role="group">
          <button
            on:click={() => {
              dispatch("zoomIn");
            }}
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            <Fa icon={faPlus} />
          </button>
          <button
            on:click={() => {
              dispatch("zoomOut");
            }}
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            <Fa icon={faMinus} />
          </button>
          <button
            on:click={() => {
              dispatch("rotate");
            }}
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            <Fa icon={faRotateRight} />
          </button>
        </div>

        <LightIconButton
          label="Search places"
          icon={faSearchLocation}
          on:click={() => {
            appState.modals.search = true;
          }}
        />
        <LightIconButton
          label="Find my location"
          icon={faLocationArrow}
          on:click={() => {
            appState.modals.geolocation = true;
          }}
        />
      </div>
    {:else if panelShown === "layer-controls"}
      <h2 class="md:hidden text-xl font-bold mb-2">Atlases</h2>
      <div class="flex max-w-full flex-wrap">
        <div class="mr-4">
          <LayerChooserDropupMenu
            choices={layerChoices}
            chosen={ layerChoices.find(d=>d.id === mapState.layers.base.id) }
            label="Base"
            on:selectionMade={(d) => {
              handleChangeLayer(d, "base");
            }}
          />
        </div>
        <div class="mr-4">
          <LayerChooserDropupMenu
            choices={layerChoices}
            chosen={ layerChoices.find(d=>d.id === mapState.layers.overlay.id) }
            label="Overlay"
            on:selectionMade={(d) => {
              handleChangeLayer(d, "overlay");
            }}
          />
        </div>
        <div>
          <LightIconButton
            label="Bibliographic information"
            icon={faBookBookmark}
            on:click={() => {
              appState.modals.biblio = true;
            }}
          />
        </div>
      </div>
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

        {#each bboxFunctions as f }

        <LightIconButton
          label={f.name}
          icon={faMagnifyingGlassArrowRight}
          on:click={()=>{ let url = f.searchFunction(mapState.extent); window.open(url); }}
        />


        {/each}


      </div>
    {:else if panelShown === "share-controls"}
      <h2 class="md:hidden text-xl font-bold mb-2">Share</h2>
      <div class="control-panel">
        <ShareLinks baseURL={instanceVariables.baseURL} mapState={mapState} />
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
    transition: color 0.5s, background-color 0.5s;
  }

  .control-tab:hover {
    background-color: rgba(255, 255, 255, 0.97);
  }

  .control-tab-active {
    background-color: rgba(255, 255, 255, 0.97);
  }
</style>
