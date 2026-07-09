<script>
  import {
    faLocationArrow,
    faSearchLocation,
    faHiking,
    faLandmark,
    faQuestionCircle,
  } from "@fortawesome/free-solid-svg-icons";

  import SvelteMarkdown from "@humanspeak/svelte-markdown";

  import { appState, allLayers } from "../state.svelte.js";
  import { applyMapState } from "../map/mapActions.js";
  import instanceVariables from "../../config/instance.json";
  import { toursEnabled } from "../../config/features.js";

  import AtlascopeLogo from "../ui/AtlascopeLogo.svelte";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import CoverageComboBox from "../ui/CoverageComboBox.svelte";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";

  let referenceLayers = $derived(allLayers.layers.filter(feature => feature.geometry === null));

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
        applyMapState({
          center: instanceVariables.defaultStartLocation.center,
          zoom: 18,
        });
      },
    },
  ].filter((button) => button.id !== "tour" || toursEnabled);

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
          <LoadingSpinner class="mr-2 w-8 h-8 dark:text-gray-600" />
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
            onclick={() => {
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
          >{allLayers.layers.length > 0 ? allLayers.layers.length - referenceLayers.length : "..."}</span
        >
        atlas layers of {instanceVariables.geographicCoverage}
      </p>
    </div>
    {#if coverageData}
      <div class="py-3">
        <div class="relative inline-block text-left w-auto">
          <CoverageComboBox
            onSelect={(item) => {
              applyMapState({
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
        onclick={() => {
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
