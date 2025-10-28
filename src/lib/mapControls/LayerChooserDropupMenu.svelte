<script>
  import { mapState, allLayers, referenceLayers } from "../state.svelte.js";
  import { requestChangeToMapState } from "../helpers/mapHelpers.js";
  import instanceVariables from "../../config/instance.json";

  const { layerName } = $props();

  let poppedFlag = $state(false);
  const customLayerNamesByViewMode = {
    "glass": {
      "base": "Base",
      "overlay": "Overlay"
    },
    "swipe-x": {
      "base": "Right",
      "overlay": "Left"
    },
    "swipe-y": {
      "base": "Bottom",
      "overlay": "Top"
    },
    "opacity": {
      "base": "Base",
      "overlay": "Overlay"
    }
  }

  let choices = $derived.by(() => {
    let c = [];
    // push the layers which are more than 20% visible to the layerChoices array, mapping the appropriate variables for menu generation
    allLayers.layers
      .toSorted((a, b) => a.properties.year - b.properties.year)
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
    referenceLayers.layers.forEach((d) =>
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
  });

  let currentLayer = $derived.by(() => {
    return choices.find((d) => d.id === mapState.layers[layerName].id);
  });


  function handleSelection(id) {
    poppedFlag = false;
    requestChangeToMapState(mapState, {
      [layerName]: id
    });
  }
</script>

<div>
  <div class="mt-1 relative">
    <button
      type="button"
      onclick={() => {
        poppedFlag = !poppedFlag;
      }}
      class="relative bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-labelledby="listbox-label"
    >
      <span class="flex items-center">
        <span class="text-gray-500 mr-1 md:mr-2 font-light text-sm md:text-lg">{customLayerNamesByViewMode[mapState.viewMode][layerName]}</span>
        {#if currentLayer && currentLayer.title}
          
          <div class="ml-1 block truncate text-gray-900 text-lg"
            >{currentLayer.title}</div
          >
          <div
            class="ml-2 text-xs bg-slate-300 text-white rounded font-semibold py-1 px-1 flex items-center"
            >{Math.round(currentLayer.pct * 100)}% <span class="hidden md:block ml-1">coverage</span></div
          >
          {:else}
          <div class="font-bold text-amber-600 text-lg ml-1 mr-2 block"
            >No layer</div
          >
        {/if}
      </span>
      <span
        class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
      >
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    <ul
      class:hidden={!poppedFlag}
      class="absolute bottom-12 z-10 mt-1 bg-white shadow-lg max-h-64 rounded-md py-1 text-base ring-1 ring-black/25 overflow-auto focus:outline-none sm:text-sm"
      tabindex="-1"
      role="listbox"
      aria-labelledby="listbox-label"
      aria-activedescendant="listbox-option-3"
    >
      {#each choices as choice}
        <li
          class="text-gray-800 {currentLayer && choice.id === currentLayer.id ? 'bg-slate-100' : ''} cursor-pointer select-none relative py-2 pl-3 pr-9 hover:text-red-900"
          role="option"
          onclick={() => {
            handleSelection(choice.id);
          }}
        >
          <div class="flex items-center">
            {#if choice && choice.title}
              <span class="font-bold text-lg ml-1 mr-2 block"
                >{choice.title}</span
              ><span class="text-sm">{choice.subtitle}</span><span
                class="ml-2 text-xs bg-slate-300 text-white rounded font-semibold py-1 px-1"
                >{Math.round(choice.pct * 100)}%</span
              >
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
</style>
