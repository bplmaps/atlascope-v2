<script>
  import Fa from "svelte-fa";
  import {
    faLocationArrow,
    faSearchLocation,
    faHiking,
    faLandmark,
    faChevronUp,
    faQuestionCircle,
  } from "@fortawesome/free-solid-svg-icons";

  import SvelteMarkdown from "svelte-markdown";

  import { appState, mapState, allLayers } from "../state.svelte.js";
  import { requestChangeToMapState } from "../helpers/mapHelpers.js";
  import instanceVariables from "../../config/instance.json";

  import AtlascopeLogo from "../ui/AtlascopeLogo.svelte";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import CoverageComboBox from "../ui/CoverageComboBox.svelte";

  let buttons = [
    {
      id: "find",
      text: "Find my location",
      icon: faLocationArrow,
      action: function () {
        appState.modals.geolocation = true;
      },
    },
    {
      id: "search",
      text: "Search places",
      icon: faSearchLocation,
      action: function () {
        appState.modals.search = true;
      },
    },
    {
      id: "tour",
      text: "Take a tour",
      icon: faHiking,
      action: function () {
        appState.modals.tourList = true;
      },
    },
    {
      id: "start",
      text: `Start at ${instanceVariables.defaultStartLocation.name}`,
      icon: faLandmark,
      action: function () {
        requestChangeToMapState(mapState, {
          center: instanceVariables.defaultStartLocation.center,
          zoom: 18,
        });
      },
    },
  ];

  const coverageData = instanceVariables.coverageDescriptiveList;
</script>

<section id="splash" class="ui-top-level-layer">
  <div id="splash-inner">
    <div class="p-0 mx-auto w-48 mb-3">
      <AtlascopeLogo pulse={true} />
    </div>
    <p class="text-xs md:text-sm mb-2">
      <strong>Atlascope {instanceVariables.name}</strong>
      {instanceVariables.tagline}.
    </p>
    <p class="text-xl font-bold">How do you want to start exploring?</p>
    {#if !appState.layersLoaded}
      <div class="grid place-items-center mt-3">
        <div>
          <svg
            aria-hidden="true"
            class="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
        <div class="text-gray-500">Loading map data</div>
      </div>
    {/if}
    <div class="my-5">
      <div class="flex justify-center max-w-full flex-wrap">
        {#each buttons as button}
          <LightIconButton
            label={button.text}
            icon={button.icon}
            on:click={() => {
              appState.modals.splash = false;
              button.action();
            }}
            disabled={!appState.layersLoaded}
          />
        {/each}
      </div>
    </div>
    <div>
      <p class="font-semibold">
        Currently serving <span
          class="bg-yellow-900 text-gray-200 text-s font-semibold mx-0.5 px-2.5 py-0.5 rounded"
          >{allLayers.layers.length > 0 ? allLayers.layers.length : "..."}</span
        >
        atlas layers of {instanceVariables.geographicCoverage}
      </p>
    </div>
    {#if coverageData}
      <div class="py-3">
        <div class="relative inline-block text-left w-auto">
          <CoverageComboBox
            onSelect={(item) => {
              requestChangeToMapState(mapState, {
                center: item.center,
                zoom: 17,
              });
              appState.modals.splash = false;
            }}
          />
        </div>
      </div>
    {/if}

    <div>
      <p class="font-light text-xs md:text-sm mt-5">
        <SvelteMarkdown source={instanceVariables.institutionalCredit} />
      </p>
    </div>
    <div class="my-3">
      <LightIconButton
        icon={faQuestionCircle}
        label="About & Credits"
        size="sm"
        on:click={() => {
          window.open(instanceVariables.aboutPage);
        }}
      />
    </div>
    {#if instanceVariables.splashPageNoteMessage}
      <div class="mt-2">
        <p>
          <a
            href={instanceVariables.splashPageNoteMessage.url}
            target="_blank"
            class="text-sm font-semibold"
          >
            {instanceVariables.splashPageNoteMessage.text}
          </a>
        </p>
      </div>
    {/if}
  </div>
</section>

<style>
  section#splash {
    background-color: rgba(255, 255, 255, 0.95);
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
  }

  #splash-inner {
    padding: 30px;
    text-align: center;
    height: 100%;
    overflow-y: auto;
  }
</style>
