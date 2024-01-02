<script>
  import instanceVariables from "../../config/instance.json";
  import { allLayers } from "../stores.js";
  import { appState } from "../stores.js";

  import LayerChooserDropupMenu from "./LayerChooserDropupMenu.svelte";
  import { parseLayerChoices } from "../helpers/layerHelpers";

  export let mainControlLayersMinimized;
  export let mapState;
  export let changeMapView;

  $: layerChoices = parseLayerChoices(
    $allLayers,
    instanceVariables.referenceLayers,
  );

  let layerLabelDictionary = {
    glass: { overlay: "Spyglass", base: "Base" },
    "swipe-x": { overlay: "Left", base: "Right" },
  };
</script>

<div class="flex place-content-center">
  {#if !mainControlLayersMinimized}
    <div class="flex flex-wrap place-content-center">
      <div class="mr-2">
        <LayerChooserDropupMenu
          choices={layerChoices}
          chosen={layerChoices.find((d) => d.id === mapState.layers.base.id)}
          label={layerLabelDictionary[mapState.viewMode].base}
          on:selectionMade={(d) => {
            changeMapView({"base": d.detail.id})
          }}
        />
      </div>
      <div>
        <LayerChooserDropupMenu
          choices={layerChoices}
          chosen={layerChoices.find((d) => d.id === mapState.layers.overlay.id)}
          label={layerLabelDictionary[mapState.viewMode].overlay}
          on:selectionMade={(d) => {
            changeMapView({"overlay": d.detail.id})
          }}
        />
      </div>
    </div>
  {:else}
    <div class="flex">
      {#each ["base", "overlay"] as lyr}
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
  <div class="flex">
    <div
    class="bg-green-800 text-gray-50 text-sm font-bold mx-1 px-1.5 py-0.5 rounded-full place-self-center"
  >
    {$allLayers.filter((layer) => layer.extentVisible > 0.2).length} <span class="font-normal hidden md:inline">layers here</span>
  </div>
  </div>

</div>
