<script>
  import Fa from "svelte-fa";
  import {
    faDraftingCompass,
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
  } from "@fortawesome/free-solid-svg-icons";

  import { createEventDispatcher } from "svelte";

  import LayerChooserDropupMenu from "./LayerChooserDropupMenu.svelte";
  import ViewModeDropupMenu from "./ViewModeDropupMenu.svelte";
  import LightIconButton from "./LightIconButton.svelte";

  import instanceVariables from "../config/instance.json";
  import { allLayers } from "./stores.js";
  import { appState } from "./stores.js";

  export let mapState;

  let dispatch = createEventDispatcher();

  let controlGroups = [
    { id: "map-controls", name: "Controls", icon: faDraftingCompass },
    { id: "layer-controls", name: "Atlases", icon: faLayerGroup },
    {
      id: "research-controls",
      name: "Research",
      icon: faMagnifyingGlassArrowRight,
    },
    {
      id: "share-controls",
      name: "Share",
      icon: faShare,
    },
  ];

  // we compose the possible layer choices out of both the $allLayers store of historic layers, and the reference layers
  $: layerChoices = parseLayerChoices(
    $allLayers,
    instanceVariables.referenceLayers
  );

  function parseLayerChoices(historicLayers, referenceLayers) {
    let c = [];
    // push the layers which are more than 20% visible to the layerChoices array, mapping the appropriate variables for menu generation
    historicLayers.sort((a,b)=>a.properties.year-b.properties.year).forEach((d) =>
      d.extentVisible > 0.2
        ? c.push({
            id: d.properties.id,
            title: d.properties.year,
            subtitle: d.properties.publisher,
            pct: d.extentVisible
          })
        : null
    );
    // add the reference layers
    referenceLayers.forEach((d) =>
      c.push({ id: d.properties.id, title: d.properties.name, subtitle: "", pct: 1.0 })
    );
    return c;
  }

  let panelShown = null;

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
  {#if $allLayers.filter((layer) => layer.extentVisible > 0.1).length === 0}
    <div
      class="w-2/3 mx-auto bg-orange-100/90 text-rose-900 py-2 px-5 rounded drop-shadow mb-4 font-semibold text-center"
    >
      <Fa icon={faExclamationCircle} class="inline mr-0.5" /> You're looking at a
      location where no historic atlas layers are currently available.
      <p class="font-light text-sm">
        <a href="./#"
          >Learn more about our plans for adding coverage to Atlascope.</a
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
          >{$allLayers.filter((layer) => layer.extentVisible > 0.1)
            .length}</span
        >
      {/if}
      <span class="hidden md:inline control-tab-label">{cg.name}</span>
    </div>
  {/each}

  {#if panelShown === "map-controls"}
    <div class="control-panel">
      <div class="flex max-w-full flex-wrap">
        <div class="mr-4">
          <ViewModeDropupMenu
            chosen={mapState.viewMode}
            on:selectionMade={handleChangeMode}
          />
        </div>
        <LightIconButton
          label=""
          icon={faPlus}
          on:click={() => {
            dispatch("zoomIn");
          }}
        />
        <LightIconButton
          label=""
          icon={faMinus}
          on:click={() => {
            dispatch("zoomOut");
          }}
        />
        <LightIconButton
          label=""
          icon={faRotateRight}
          on:click={() => {
            dispatch("rotate");
          }}
        />

        <LightIconButton
          label="Search places"
          icon={faSearchLocation}
          on:click={() => {
            $appState.modals.search = true;
          }}
        />
        <LightIconButton label="Find my location" icon={faLocationArrow} />
      </div>
    </div>
  {:else if panelShown === "layer-controls"}
    <div class="control-panel">
      <div class="flex max-w-full flex-wrap">
        <div class="mr-4">
          <LayerChooserDropupMenu
            choices={layerChoices}
            chosen={mapState.layers.base.title}
            label="Base"
            on:selectionMade={(d) => {
              handleChangeLayer(d, "base");
            }}
          />
        </div>
        <div>
          <LayerChooserDropupMenu
            choices={layerChoices}
            chosen={mapState.layers.overlay.title}
            label="Overlay"
            on:selectionMade={(d) => {
              handleChangeLayer(d, "overlay");
            }}
          />
        </div>
        <div class="ml-4">
          <LightIconButton
            label="Bibliographic information"
            icon={faBookBookmark}
            on:click={() => { $appState.modals.biblio = true;
            }}
          />
        </div>
      </div>
    </div>
  {:else if panelShown === "research-controls"}
    <div class="control-panel">Research tools here</div>
  {:else if panelShown === "share-controls"}
    <div class="control-panel">
      <div class="mb-2 flex">
        <label for="share-app-url" class="text-sm text-right pr-3"
          >Share the Atlascope app</label
        >
        <input
          type="text"
          id="share-app-url"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value="https://atlascope.leventhalmap.org"
        />
        <button class="ml-2"><Fa icon={faCopy} class="inline" /></button>
      </div>

      <div class="flex">
        <label for="share-app-url" class="text-sm text-right pr-3"
          >Share this specific view</label
        >
        <input
          type="text"
          id="share-app-url"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value="https://atlascope.leventhalmap.org/#/view/..."
        />
        <button class="ml-2"><Fa icon={faCopy} class="inline" /></button>
      </div>
    </div>
  {/if}
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

  .control-panel {
    padding: 30px;
    background-color: rgba(255, 255, 255, 0.97);
  }
</style>
