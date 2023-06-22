<script>
  import Fa from "svelte-fa";
  import {
    faLayerGroup,
    faMagnifyingGlassArrowRight,
    faMagnifyingGlassLocation,
    faMap,
    faShare,
  } from "@fortawesome/free-solid-svg-icons";

  import LayerChooserDropupMenu from "./LayerChooserDropupMenu.svelte";

  import { createEventDispatcher } from "svelte";
  let dispatch = createEventDispatcher();

  function handleChangeLayer(d, layer) {
    dispatch("changeLayer", { id: d.detail.id, layer: layer });
  }

  export let mapState;
  import instanceVariables from "../config/instance.json";
  import { allLayers } from "./stores.js";
  import { appState } from "./stores.js";

  let controlState = "default";

  let layerLabelDictionary = {
    glass: { overlay: "Spyglass", base: "Base" },
    "swipe-x": { overlay: "Left", base: "Right" },
  };

  let controlGroups = [
    { id: "view", name: "View Controls", icon: faMap },
    {
      id: "search",
      name: "Search Places",
      icon: faMagnifyingGlassLocation,
    },
    {
      id: "research",
      name: "Research Tools",
      icon: faMagnifyingGlassArrowRight,
    },
    {
      id: "share",
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
    historicLayers
      .sort((a, b) => a.properties.year - b.properties.year)
      .forEach((d) => {
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
</script>

<section>
  <div class="drop-shadow-xl mx-auto w-fit h-fit">
    <div class="w-full border-b-2 bg-stone-50 rounded-t-lg p-2">
      {#if controlState === "default"}
        <div class="flex">
          <div class="mr-2">
            <LayerChooserDropupMenu
              choices={layerChoices}
              chosen={layerChoices.find(
                (d) => d.id === mapState.layers.base.id
              )}
              label={layerLabelDictionary[mapState.viewMode].base}
              on:selectionMade={(d) => {
                handleChangeLayer(d, "base");
              }}
            />
          </div>
          <div>
            <LayerChooserDropupMenu
              choices={layerChoices}
              chosen={layerChoices.find(
                (d) => d.id === mapState.layers.overlay.id
              )}
              label={layerLabelDictionary[mapState.viewMode].overlay}
              on:selectionMade={(d) => {
                handleChangeLayer(d, "overlay");
              }}
            />
          </div>
        </div>
      {:else}
        <div class="flex">
          {#each ["overlay", "base"] as lyr}
            <div
              class="text-sm text-stone-500 bg-stone-200 px-2 py-0.5 rounded mr-2"
            >
              {layerLabelDictionary[mapState.viewMode][lyr]}
              <span class="font-bold">
                {mapState.layers[lyr].properties.fallbackTitle
                  ? mapState.layers[lyr].properties.fallbackTitle
                  : mapState.layers[lyr].properties.year}
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="w-full bg-stone-400 rounded-b-lg p-2">
      <div class="w-full mx-auto">
        <div class="flex justify-center">
          {#each controlGroups as cg}
            <div
              class="bg-stone-600 shadow-inner p-2 rounded mr-1 flex"
              on:click={() => {
                controlState = cg.id;
              }}
            >
              <div><Fa icon={cg.icon} class="text-stone-50" /></div>
              <div
                class="hidden md:inline-block ml-2 text-xs font-semibold text-stone-50"
              >
                {cg.name}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  section {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
  }
</style>
