<script>
  import Fa from "svelte-fa";
  import {
    faExclamationCircle,
    faSearchLocation,
    faPlus,
    faMinus,
    faRotateRight,
  } from "@fortawesome/free-solid-svg-icons";

  import { createEventDispatcher } from "svelte";

  import LayerChooserDropupMenu from "./LayerChooserDropupMenu.svelte";
  import ViewModeDropupMenu from "./ViewModeDropupMenu.svelte";
  import LightIconButton from "./LightIconButton.svelte";
  import AtlascopeLogo from "./AtlascopeLogo.svelte";

  import instanceVariables from "../config/instance.json";
  import { allLayers } from "./stores.js";
  import { appState } from "./stores.js";

  export let mapState;

  let dispatch = createEventDispatcher();

  // we compose the possible layer choices out of both the $allLayers store of historic layers, and the reference layers
  $: layerChoices = parseLayerChoices(
    $allLayers,
    instanceVariables.referenceLayers
  );

  function parseLayerChoices(historicLayers, referenceLayers) {
    let c = [];
    // push the layers which are more than 20% visible to the layerChoices array, mapping the appropriate variables for menu generation
    historicLayers
      .sort((a, b) => a.properties.year - b.properties.year)
      .forEach((d) => {
        console.log(d.extentVisible);
        if (d.extentVisible > 0.2) {
          c.push({
            id: d.properties.identifier,
            title: d.properties.fallbackTitle
              ? d.properties.fallbackTitle
              : d.properties.year,
            subtitle: d.properties.fallbackSubtitle
              ? d.properties.fallbackSubtitle
              : d.properties.publisherShort,
            pct: d.extentVisible,
          });
        }
      });
    // add the reference layers
    referenceLayers.forEach((d) =>
      c.push({
        id: d.properties.identifier,
        title: d.properties.fallbackTitle
          ? d.properties.fallbackTitle
          : d.properties.year,
        subtitle: d.properties.fallbackSubtitle
          ? d.properties.fallbackSubtitle
          : d.properties.publisherShort,
        pct: 1.0,
      })
    );
    return c;
  }

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

  <div class="bg-white p-4 block rounded-t-2xl">
    <div class="w-full mb-2">
      <div class="w-36 h-auto">
        <AtlascopeLogo pulse={true} />
      </div>
    </div>

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

      <div class="mr-4">
        <LightIconButton
          label="Search places"
          icon={faSearchLocation}
          on:click={() => {
            $appState.modals.search = true;
          }}
        />
      </div>

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

    </div>
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
