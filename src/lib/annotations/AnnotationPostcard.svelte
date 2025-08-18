<script>
  import { mapState, appState } from "../state.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  let {
    getAnnotationPostcard,
    closeAnnotationListModal,
    enableAnnotationMode,
    loadAnnotations,
    annoData,
  } = $props();
  import { parseUrlParams, stripHash } from "../helpers/initializingFunctions";
  import { faQuoteLeft, faArrowLeft, faQuestionCircle, faQuestion } from "@fortawesome/free-solid-svg-icons";
  import { bboxFunctions } from "../../config/research-connections.js";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import BibliographicBug from "../ui/BibliographicBug.svelte";
  import Fa from "svelte-fa";

  let layerData = $state(null);
  let load = $state(false);
  let formatted = $state();

  onMount(async () => {
    setTimeout(getYear, 800);
  });

  async function getYear() {
    const res = await fetch(
      `https://s3.us-east-2.wasabisys.com/urbanatlases/${annoData.layer.substring(annoData.layer.length - 9)}/tileset.json`
    );
    layerData = await res.json();
    const options = { year: "numeric" };
    formatted = new Date(annoData.timestamp).toLocaleDateString(
      "en-US",
      options
    );
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

<div id="container" class="absolute bottom-10 left-10 right-10 rounded">
  <div class="relative mx-auto max-w-[1000px] rounded-xl bg-white/95 shadow">
    {#if load}
      <div
        class="flex items-center justify-between border-b border-gray-300 px-4 py-3"
      >
        <LightIconButton
          label="Return"
          icon={faArrowLeft}
          size="sm"
          on:click={() => returnToAnnotations()}
        />
        <div class="flex flex-col items-center text-center">
          <h1 class="font-bold text-lg">A digital postcard</h1>
          <!-- <p class="text-xs text-gray-600">from {formatted} to {layerData.name.slice(-4)}</p> -->
          <div class="mt-1 text-sm">
            <BibliographicBug />
          </div>
        </div>
        <button
          onclick={trashPostcard}
          class="rounded border border-amber-800 px-2 py-0.5 text-sm text-amber-800 hover:bg-amber-50 hover:cursor-pointer"
          aria-label="Close postcard"
        >
          ✕
        </button>
      </div>
      <div
        in:fly={{ y: 300 }}
        class="relative flex max-h-36 overflow-y-auto px-6 py-4 items-start"
      >
        <Fa
          icon={faQuoteLeft}
          class="text-3xl text-gray-400 mr-3"
        />
        <p class="text-gray-800 p-4">{annoData.body}</p>
      </div>
      <div
        in:fly={{ y: 300 }}
        class="border-t border-gray-300 px-8 py-4 text-xs text-gray-500"
      > <Fa icon={faQuestionCircle} class="inline"/>
        The annotation and text in this digital postcard was created by an Atlascope user. LMEC staff
        cannot fact check each postcard, but we do read and approve them all for
        public viewing.
        <button
          onclick={startAnnotating}
          id="footerlink"
          class="font-semibold text-red-800 hover:cursor-pointer pl-[1px]"
        >
          Try making your own!
        </button>
      </div>
    {/if}
  </div>
</div>


<style>
  div > button#footerlink:hover {
    background-image: linear-gradient(
      0deg,
      rgba(0, 102, 136, 0.2) 35%,
      transparent 0
    );
  }
</style>
