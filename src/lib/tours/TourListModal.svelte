<script>
  import Fa from "svelte-fa";

  import {
    faCircleArrowRight,
    faHiking,
  } from "@fortawesome/free-solid-svg-icons";

  import { onMount } from "svelte";
  import { loadAllTours } from "./tourFunctions.js";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";

  import { appState } from "../state.svelte.js";

  let loadingFlag = $state(true);
  let tours = $state([]);

  onMount(() => {
    loadAllTours().then((d) => {
      tours = d.data;
      loadingFlag = false;
    });
  });

  function startTour(id) {
    appState.tour.id = id;
    appState.tour.active = true;
    appState.modals.tourList = false;
  }
</script>

<section id="search-modal">
  <div class="modal-outer">
    <div class="modal-inner relative w-full md:w-[60%] mx-auto">
      <h1
        class="sticky absolute top-0 left-0 right-0 bg-white/90 text-xl font-bold p-4"
      >
        <Fa icon={faHiking} class="inline mr-2" />Take a tour
      </h1>
      {#if loadingFlag}
        <div class="text-center text-gray-600 w-full p-5">
          <div>
            <LoadingSpinner class="inline mr-2 w-8 h-8" />
          </div>
          Loading tours ...
        </div>
      {:else}
        <div class="px-5">
          <ul>
            {#each tours as tour (tour.id)}
              {#if tour?.metadataJson?.title}
                <li
                  onclick={() => {
                    startTour(tour.id);
                  }}
                  class="text-gray-700 py-2 border-b-2 border-gray-200 cursor-pointer text-md hover:text-red-900 group"
                >
                  <Fa
                    icon={faCircleArrowRight}
                    class="mr-1 inline text-sm text-slate-100 group-hover:text-red-900"
                  />
                  {tour.metadataJson.title}
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      {/if}
      <div class="text-gray-700 bg-gray-100 px-8 py-8 italic text-sm">
        <a class="underline text-red-900" href="mailto:frontdesk@leventhalmap.org"
          >Get in touch</a
        > to learn how you can write your own Atlascope tour
      </div>
    </div>
  </div>
</section>

<style>
  section {
    background-color: rgba(16, 16, 16, 0.853);
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
  }

  .modal-outer {
    padding: 30px;
  }

  .modal-inner {
    background-color: white;
    border-radius: 5px;
    min-height: 200px;
    max-height: 500px;
    overflow-y: auto;
  }
</style>
