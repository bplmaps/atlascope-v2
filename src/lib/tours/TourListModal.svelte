<script>
  import Fa from "svelte-fa";

  import {
    faArrowCircleRight,
    faCircleArrowRight,
    faHiking,
  } from "@fortawesome/free-solid-svg-icons";

  import { onMount } from "svelte";
  import { loadAllTours } from "../helpers/supabaseFunctions.js";

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
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold mb-3">
        <Fa icon={faHiking} class="inline mr-2" />Take a tour
      </h1>

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
        <div>
          <ul>
            {#each tours as tour}
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
    padding: 20px;
    min-height: 200px;
  }
</style>
