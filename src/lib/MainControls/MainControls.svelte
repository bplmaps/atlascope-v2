<script>
  import Fa from "svelte-fa";
  import {
    faExclamationCircle,
    faMagnifyingGlassArrowRight,
    faMagnifyingGlassLocation,
    faMap,
    faShare,
  } from "@fortawesome/free-solid-svg-icons";

  import LayerControls from "./LayerControls.svelte";
  import ViewControls from "./ViewControls.svelte";

  import { createEventDispatcher } from "svelte";
  let dispatch = createEventDispatcher();

  export let mapState;
  export let changeMapView;

  let controlGroups = [
    { id: "view", name: "View", icon: faMap, component: ViewControls },
    {
      id: "search",
      name: "Search",
      icon: faMagnifyingGlassLocation,
    },
    {
      id: "research",
      name: "Research",
      icon: faMagnifyingGlassArrowRight,
    },
    {
      id: "share",
      name: "Share",
      icon: faShare,
    },
  ];

  let activeControl;
</script>

<section>
  <div
    class="drop-shadow-xl mx-auto w-fit h-fit ring-1 ring-neutral-50 ring-offset-1 rounded-lg"
  >
    <div class="bg-stone-50 rounded-t-lg p-2 flex justify-center">
      <LayerControls
        mainControlLayersMinimized={activeControl}
        {mapState}
        {changeMapView}
      />
    </div>
    <div class="w-full bg-stone-400 shadow-inner rounded-b-lg p-2">
      {#if activeControl}
        <div class="flex w-full">
          <button
            on:click={() => {
              activeControl = null;
            }}
            class="rounded-md bg-gray-900 text-gray-50 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span class="sr-only">Close</span>
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div class="ml-2 font-semibold text-lg">
            {activeControl.name}
          </div>
        </div>

        <svelte:component this={activeControl.component} {mapState} {changeMapView} />

      {:else}
        <div class="w-full mx-auto">
          <div class="flex justify-center">
            {#each controlGroups as cg}
              <button
                class="bg-stone-600 shadow-inner p-2 rounded mr-1 flex cursor-pointer"
                on:click={() => {
                  activeControl = cg;
                }}
              >
                <div><Fa icon={cg.icon} class="text-stone-50" /></div>
                <div
                  class="hidden md:inline-block ml-2 text-xs font-semibold text-stone-50"
                >
                  {cg.name}
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  section {
    position: absolute;
    bottom: 10px;
    left: 20px;
    right: 20px;
  }
</style>
