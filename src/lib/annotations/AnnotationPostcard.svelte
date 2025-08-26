<script lang="ts">
  import { appState } from "../state.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import {
    faQuoteLeft,
    faArrowLeft,
    faQuestionCircle,
    faDownload,
    faSquareArrowUpRight,
    faShare
  } from "@fortawesome/free-solid-svg-icons";
  import instanceVariables from "../../config/instance.json";
  import { parseUrlParams, stripHash } from "../helpers/initializingFunctions";
  import { copyUrl } from "../helpers/copyUrl";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import BibliographicBug from "../ui/BibliographicBug.svelte";
  import Fa from "svelte-fa";
  import AtlascopeLogo from "../ui/AtlascopeLogo.svelte";
  import {
    downloadMapView,
    openMapView,
  } from "../helpers/downloadAndOpenMapView";

  let {
    getAnnotationPostcard,
    closeAnnotationListModal,
    enableAnnotationMode,
    loadAnnotations,
    annoData,
    map,
  } = $props();

  let load = $state(false);
  let revealed = $state(false);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  let date = $state<string>();

  const buttons = [
    {
      type: "copy",
      label: "Share with a friend",
      icon: faShare,
      click: () => copyUrl(appState, instanceVariables),
    },
    {
      type: "return",
      label: "Return to annotations",
      icon: faArrowLeft,
      click: () => returnToAnnotations(),
    },
    {
      type: "download",
      label: "Download this postcard",
      icon: faDownload,
      click: () => downloadMapView(map),
    },
    {
      type: "open",
      label: "Open in new tab",
      icon: faSquareArrowUpRight,
      click: () => openMapView(map),
    },
  ];

  onMount(async () => {
    getAnnotationPostcard();
    setTimeout(delay, 400);
  });

  async function delay() {
    load = true;
    formatDate(annoData.timestamp);
  }

  function trashPostcard() {
    appState.annotation.active = false;
    const urlParams = parseUrlParams(
      window.location.hash.substring(2).split("?")[0]
    );
    stripHash();
    closeAnnotationListModal();
  }

  function formatDate(d: string | number | Date) {
    date = new Date(d).toLocaleDateString("en-US", options);
  }

  function startAnnotating() {
    trashPostcard();
    enableAnnotationMode();
  }

  function returnToAnnotations() {
    trashPostcard();
    loadAnnotations();
  }

  function reveal() {
    revealed = !revealed;
  }
</script>

<div
  in:fly={{ y: 300 }}
  id="container"
  class="absolute bottom-5 left-5 right-5 rounded"
>
  {#if load}
    <div
      class="relative mx-auto max-w-[1000px] max-h-80 overflow-y-auto rounded-xl bg-white/95 shadow pr-3"
    >
      <div
        id="postcardHeader"
        class="sticky top-0 py-2 flex justify-center shadow-b-md border-b border-gray-200 bg-white z-10"
      >
        <div class="flex flex-row gap-1 text-center mb-1">
          <div class="flex flex-col">
            <AtlascopeLogo />
            <div class="relative text-xs md:text-sm -mr-16 py-2">
              <BibliographicBug />
            </div>
          </div>
          <img
            alt="postcard"
            class="max-h-12"
            src="https://iiif.digitalcommonwealth.org/iiif/2/commonwealth:p554bm89z/1729,162,1085,333/1200,/0/bitonal.jpg"
          />
        </div>
        <button
          onclick={trashPostcard}
          class="absolute right-2 top-2 rounded border border-transparent hover:border hover:border-amber-900 px-2 py-0.5 text-xs text-gray-800 hover:bg-amber-100 hover:cursor-pointer"
          aria-label="Close postcard"
        >
          ✕
        </button>
        <img
          alt="LMEC stamp logo"
          class="collapse md:visible max-h-12 absolute top-4 right-12"
          src="../../../public/lmec-stamp.png"
        />
      </div>
      <div
        id="postcard"
        in:fly={{ y: 300 }}
        class="flex flex-col md:flex-row overflow-y-auto py-4 md:py-10"
      >
        <div class="flex flex-col md:w-screen md:flex-row">
          <Fa
            icon={faQuoteLeft}
            class="invisible md:visible text-4xl text-stone-600 pl-4"
          />
          <div class="text-2xl text-stone-600 font-[Caveat] flex-col md:w-[60%]">
            <p id="postText" class="p-2 md:p-6">
              {annoData.body}
            </p>
            <div
            id="postDate"
              class="flex-col font-semibold font-mono py-2 text-xs text-transparent bg-clip-text bg-gradient-to-l from-[#8D9CB6] to-[#B3BCCB] p-2 uppercase text-center tracking-widest"
            >
              — postcard dated {date}
            </div>
          </div>
          <div
            in:fly={{ y: 300 }}
            class="md:w-[40%] text-center py-2 px-6 border-l-2 border-dotted border-gray-300"
          >
            {#each buttons as button, i}
              <div
                class={`py-2 border-t-2 border-stone-300 ${i > 2 ? "border-b-2 " : "mb-2"}`}
              >
                <LightIconButton
                  label={button.label}
                  icon={button.icon}
                  size="sm"
                  bgColor="!bg-stone-100"
                  on:click={button.click}
                />
              </div>
            {/each}
            <a aria-label="false" id="image-download" download="postcard.png"
            ></a>
          </div>
        </div>
      </div>
      <div
        in:fly={{ y: 300 }}
        class="border-t border-gray-300 px-8 py-3 text-xs text-gray-500 bg-gray-100"
      >
        <Fa icon={faQuestionCircle} class="inline -ml-5" />
        The annotation and text in this digital postcard were created by an
        Atlascope user. LMEC staff are unable to fact check each postcard, but
        we do read and approve them all before making them public. Make your own
        postcard by
        <button
          onclick={startAnnotating}
          id="footerlink"
          class="font-semibold text-red-800 hover:cursor-pointer pl-[1px]"
        >
          annotating Atlascope!
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Grape+Nuts&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Caveat&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Nothing+You+Could+Do&display=swap");

  button#footerlink:hover {
    background-image: linear-gradient(
      0deg,
      rgba(0, 102, 136, 0.2) 35%,
      transparent 0
    );
  }

  #postcard {
    background-image: linear-gradient(
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.2)
      ),
      url("https://iiif.digitalcommonwealth.org/iiif/2/commonwealth:p554bm89z/25,980,3287,1424/1200,/0/default.jpg");
  }
</style>
