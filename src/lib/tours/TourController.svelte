<script>
  import Fa from "svelte-fa";

  import SvelteMarkdown from "@humanspeak/svelte-markdown";
  import ExternalLinkRenderer from "../helpers/ExternalLinkRenderer.svelte";
  import BibliographicBug from "../ui/BibliographicBug.svelte";

  import { loadSingleTour } from "./tourFunctions.js";
  import {
    faArrowLeft,
    faHiking,
    faArrowRight,
    faDoorOpen,
    faArrowsTurnToDots,
    faArrowCircleRight,
    faShare,
    faLink
  } from "@fortawesome/free-solid-svg-icons";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";

  import { appState } from "../state.svelte.js";
  import { applyMapState } from "../map/mapActions.js";

  import { onMount } from "svelte";

  import instanceVariables from "../../config/instance.json";

  let loadingFlag = $state(true);
  let tourData = $state(null);
  let currentStop = $state(-1);
  let shareUrl = `${instanceVariables.baseURL}/#/view:tour$tour:${appState.tour.id}`

  function tourStepBack() {
    currentStop = currentStop - 1;
    goToCurrentStop();
  }

  function tourStepForward() {
    currentStop = currentStop + 1;
    goToCurrentStop();
  }

  function goToCurrentStop() {
    let cs = tourData.stopsJson[currentStop === -1 ? 0 : currentStop];
    applyMapState({
      center: cs.center,
      zoom: cs.zoom,
      viewMode: cs.viewMode,
      overlay: cs.overlay,
      base: cs.base,
      animate: 800
    });
  }

  function startOver() {
    currentStop = 0;
    goToCurrentStop();
  }

  onMount(() => {
    loadSingleTour(appState.tour.id).then((d) => {
      tourData = d.data[0];
      loadingFlag = false;
      goToCurrentStop();
    });
  });
</script>

<div id="container" class="rounded">
  <div class="max-w-[1000px] mx-auto rounded-xl p-2 bg-white/95">
    {#if loadingFlag}
      <div class="text-center text-gray-600 w-full p-5">
        <div>
          <LoadingSpinner class="inline mr-2 w-8 h-8" />
        </div>
        Loading tour ...
      </div>
    {:else}
      <div
        class="w-full border-b-2 border-b-gray-200 px-1 pb-2 flex flex-col md:flex-row"
      >
        {#if currentStop === -1}
          <div class="flex items-center grow">
            <div
              class="text-gray-500 text-sm p-3 font-bold uppercase tracking-wider mr-1"
            >
              <Fa icon={faHiking} class="inline mr-1" />Tour
            </div>
            <div class="p-3 grow">
              <h2 class="inline text-xl font-bold">
                {tourData.metadataJson.title}
              </h2>
            </div>
            <LightIconButton
              label="Start tour"
              size="lg"
              icon={faArrowCircleRight}
              onclick={tourStepForward}
            />
          </div>
        {:else}
          <div class="flex justify-center items-center">
            <div
              class="mt-1 mr-3 inline-flex rounded-md shadow-sm"
              role="group"
            >
              <button
                onclick={tourStepBack}
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
                onclick={() => {
                  appState.tour.active = false;
                }}
                type="button"
                class="flex items-center gap-2 py-2 px-4 text-md font-medium bg-white border-t border-b border-r border-gray-300"
              >
                <Fa icon={faDoorOpen} />
                <div class="hidden md:block">Leave</div>
              </button>

              <button
                onclick={tourStepForward}
                disabled={currentStop === tourData.stopsJson.length - 1}
                type="button"
                class="py-2 px-4 text-md font-medium {currentStop ===
                tourData.stopsJson.length - 1
                  ? 'text-gray-100'
                  : 'text-gray-900'} bg-white rounded-r-lg border-t border-b border-r border-gray-300 {currentStop ===
                tourData.stopsJson.length - 1
                  ? null
                  : ' hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700'}"
              >
                <Fa icon={faArrowRight} />
              </button>

              
            </div>

            <LightIconButton
                label="Share link"
                size="md"
                icon={faLink}
                collapsibleLabel={true}
                onclick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  window.alert("Link copied to clipboard");
                }}
              />

            <BibliographicBug />
            
          </div>
        {/if}
      </div>

      <div class="px-4 py-3" id="captions">
        {#if currentStop === -1}
          <h2 class="text-lg">{tourData.metadataJson.subtitle}</h2>
          <h3 class="text-sm text-gray-500">
            Written by {tourData.metadataJson.author} · {new Date(
              tourData.metadataJson.creationDate,
            ).toLocaleDateString("en-US", {
              year: "numeric",
              day: "numeric",
              month: "long",
            })}
          </h3>
        {:else}
          <div class="max-h-[20vh] overflow-y-auto">
            <SvelteMarkdown
              source={tourData.stopsJson[currentStop].caption}
              renderers={{ link: ExternalLinkRenderer }}
            />
          </div>

          {#if currentStop === tourData.stopsJson.length - 1}<LightIconButton
              label="Back to the beginning"
              size="xs"
              icon={faArrowsTurnToDots}
              onclick={startOver}
            />{/if}
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  #container {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
</style>
