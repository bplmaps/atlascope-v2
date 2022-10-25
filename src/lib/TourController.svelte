<script>
  import Fa from "svelte-fa";

  import { createEventDispatcher, onMount } from "svelte";

  import SvelteMarkdown from "svelte-markdown";

  let dispatch = createEventDispatcher();

  import { loadSingleTour } from "./helpers/faunaFunctions.js";
  import {
    faArrowLeft,
    faHiking,
    faArrowRight,
    faDoorOpen,
    faArrowsTurnToDots,
  } from "@fortawesome/free-solid-svg-icons";
  import LightIconButton from "./LightIconButton.svelte";

  export let changeMapView;

  export let tourId;
  let loadingFlag = true;
  let tourData;
  let currentStop = -1;

  function tourStepBack() {
    currentStop = currentStop - 1;
    goToCurrentStop();
  }

  function tourStepForward() {
    currentStop = currentStop + 1;
    goToCurrentStop();
  }

  function goToCurrentStop() {
    let cs = tourData.stops[currentStop === -1 ? 0 : currentStop];
    changeMapView({
      center: cs.center,
      zoom: cs.zoom,
      viewMode: cs.viewMode,
      overlay: cs.overlay,
      base: cs.base,
    });
  }

  function startOver() {
    currentStop = 0;
    goToCurrentStop();
  }

  onMount(() => {
    loadSingleTour(tourId).then((d) => {
      tourData = d.data;
      loadingFlag = false;
      goToCurrentStop();
    });
  });
</script>

<div id="container" class="rounded">
  {#if loadingFlag}
    <div class="text-center text-gray-600 w-full p-5">
      <div>
        <svg
          aria-hidden="true"
          class="inline mr-2 w-8 h-8 text-gray-200 animate-spin fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
      Loading tours ...
    </div>
  {:else}
    <div class="w-full border-b-2 px-1 pb-2 flex flex-col md:flex-row">
      {#if currentStop === -1}
      <div class="flex items-center grow">
        <div
          class="text-gray-500 text-sm p-3 font-bold uppercase tracking-wider mr-1"
        >
          <Fa icon={faHiking} class="inline mr-1" />Tour
        </div>
        <div class="p-3 grow">
          <h2 class="inline text-xl font-bold">{tourData.metadata.title}</h2>
        </div>
      </div>
      {/if}
      <div class="flex justify-center items-center">
        <div class="mt-1 mr-3 inline-flex rounded-md shadow-sm" role="group">
          <button
            on:click={tourStepBack}
            disabled={currentStop === -1}
            type="button"
            class="py-2 px-4 text-md font-medium {currentStop === -1
              ? 'text-gray-100'
              : 'text-gray-900'} bg-white rounded-l-lg border border-gray-300 {currentStop ===
            -1
              ? null
              : ' hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700'}"
          >
            <Fa icon={faArrowLeft} />
          </button>
          <button
            on:click={tourStepForward}
            disabled={currentStop === tourData.stops.length - 1}
            type="button"
            class="py-2 px-4 text-md font-medium {currentStop ===
            tourData.stops.length - 1
              ? 'text-gray-100'
              : 'text-gray-900'} bg-white rounded-r-lg border-t border-b border-r border-gray-300 {currentStop ===
            tourData.stops.length - 1
              ? null
              : ' hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700'}"
          >
            <Fa icon={faArrowRight} />
          </button>
        </div>
        <LightIconButton
          label="Leave tour"
          size="sm"
          icon={faDoorOpen}
          on:click={() => {
            dispatch("leaveTour");
          }}
        />
      </div>
    </div>

    <div class="px-4 py-3" id="captions">
      {#if currentStop === -1}
        <h2 class="text-lg">{tourData.metadata.subtitle}</h2>
        <h3 class="text-sm text-gray-500">
          Written by {tourData.metadata.author} · {new Date(
            tourData.metadata.creationDate
          ).toLocaleDateString("en-US", {
            year: "numeric",
            day: "numeric",
            month: "long",
          })}
        </h3>
      {:else}
        <SvelteMarkdown source={tourData.stops[currentStop].caption} />
        {#if currentStop === tourData.stops.length - 1}<LightIconButton
            label="Back to the beginning"
            size="xs"
            icon={faArrowsTurnToDots}
            on:click={startOver}
          />{/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  #container {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.95);
  }
</style>
