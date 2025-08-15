<script>
  import { mapState, appState } from "../state.svelte";
  import { fly, fade } from "svelte/transition";
  import { onMount } from "svelte";
  let { getAnnotationPostcard, closeAnnotationListModal, enableAnnotationMode, loadAnnotations, annoData } = $props();
  import { parseUrlParams, stripHash } from "../helpers/initializingFunctions";
  import {
    faQuoteLeft,
    faPen,
    faMagnifyingGlassArrowRight,
    faAddressCard,
    faArrowLeft
  } from "@fortawesome/free-solid-svg-icons";
  import { bboxFunctions } from "../../config/research-connections.js";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import Fa from "svelte-fa";

  let layerData = $state(null);
  let load = $state(false);
  let formatted = $state()

  onMount(async () => {
    setTimeout(getYear, 800);
  });

  async function getYear() {
    const res = await fetch(
      `https://s3.us-east-2.wasabisys.com/urbanatlases/${annoData.layer.substring(annoData.layer.length - 9)}/tileset.json`
    );
    layerData = await res.json();
    const options = { year: "numeric"};
    formatted = new Date(annoData.timestamp).toLocaleDateString("en-US", options);
    load = true;
  }

  function trashPostcard() {
    appState.annotation.active = false;
    const urlParams = parseUrlParams(
      window.location.hash.substring(2).split("?")[0]
    );
    console.log(urlParams);
    stripHash();
    closeAnnotationListModal();
  }

  function startAnnotating() {
    trashPostcard();
    enableAnnotationMode();
  }

  function returnToAnnotations() {
    trashPostcard();
    loadAnnotations();
  }

  getAnnotationPostcard();
</script>

<div id="container" class="rounded absolute bottom-10 left-10 right-10">
  <div class="relative max-w-[1000px] mx-auto rounded-xl bg-white/95">
    {#if load}
      <h1
        class="text-center font-bold text-lg border-b border-gray-300 p-4"
      >
        <Fa icon={faQuoteLeft} class="text-gray-400 text-3xl absolute" />
        {#if layerData}
          A digital postcard, from {formatted} to {layerData.name.slice(-4)}
        {/if}
      </h1>
      <div in:fly={{ y: 300 }} class="flex flex-col max-h-36 overflow-auto p-8">
        <p>{annoData.body}</p>

        <button
          onclick={trashPostcard}
          class="absolute top-4 right-4 border border-amber-800 text-amber-800 text-sm px-2 py-1 rounded hover:cursor-pointer hover:bg-amber-50"
        >
          x
        </button>
        <div class="pt-4 pl-4 text-xs">
          <LightIconButton
          label="Return to annotations"
          icon={faArrowLeft}
          on:click={() => returnToAnnotations()} />
          <!-- {#each bboxFunctions as f}
            {#if f.name === "Search postcards here"}
              <LightIconButton
                label={"Search more postcards here"}
                icon={faMagnifyingGlassArrowRight}
                on:click={() => {
                  let url = f.searchFunction(mapState.extent);
                  console.log(mapState.extent)
                  window.open(url);
                }}
              />
            {/if}
          {/each} -->
        </div>
      </div>
      <div
        in:fly={{ y: 300 }}
        class="border-t border-gray-300 text-gray-500 text-sm py-4 px-8"
      >
        While LMEC staff cannot fact check each annotation, we do read
        and approve them all for public viewing. <button onclick={startAnnotating} class="font-semibold hover:cursor-pointer text-red-800">Try making your own!</button>
      </div>
    {/if}
  </div>
</div>

<style>
    div > button:hover {
        background-image: linear-gradient(0deg, rgba(0, 102, 136, 0.2) 35%, transparent 0);
    }
</style>
