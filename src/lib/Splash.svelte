<script>
  import { createEventDispatcher } from "svelte";

  import Fa from "svelte-fa";
  import {
    faLocationArrow,
    faSearchLocation,
    faHiking,
    faLandmark,
    faChevronUp,
    faQuestionCircle,
    faClipboardQuestion,
    faPersonCircleQuestion,
  } from "@fortawesome/free-solid-svg-icons";

  import SvelteMarkdown from "svelte-markdown";

  const dispatch = createEventDispatcher();

  import { allLayers } from "./stores.js";
  import { appState } from "./stores.js";
  import instanceVariables from "../config/instance.json";
  import AtlascopeLogo from "./AtlascopeLogo.svelte";
  import LightIconButton from "./LightIconButton.svelte"; 
  import introJs from "intro.js";
  import "intro.js/introjs.css";

  function splashButton(b) {
    $appState.gateway = false;
    dispatch("splashButton", b);
  }

  let buttons = [
    { id: "find", text: "Find my location", icon: faLocationArrow },
    { id: "search", text: "Search places", icon: faSearchLocation },
    { id: "tour", text: "Take a tour", icon: faHiking },
    { id: "start", text: `Start at ${instanceVariables.defaultStartLocation.name}`, icon: faLandmark },
  ];

  let coverageDescriptiveListMenuPopFlag = false;

  function startHelpIntro(){
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            title: 'Welcome! 👋',
            intro: `Atlascope ${instanceVariables.tagline}. This guide will walk you through some of the ways you can use the tool.`
          },
          {
            element: document.querySelector('#find'),
            title: "Place Yourself in History",
            intro: "If you want, you can allow Atlascope to find your location, so that you can peek into the past of the place you're standing. (This is especially fun if you're on your cell phone!)"
          },
          {
            element: document.querySelector('#search'),
            title: "Search a Modern Address",
            intro: 'You can also start using Atlascope by searching for a modern address or place name.'
          },
          {
            element: document.querySelector('#tour'),
            title: "Take an Atlascope Tour",
            intro: 'You can also start using the tool by seeing some of the narrative tours that use Atlascope.'
          },
          {
            title: "Jump Into the Map",
            element: document.querySelector('#start'),
            intro: "You can also jump straight to our starting location to begin exploring the map. We'll do that in the next step!"
          },
          {
            element: document.querySelector('#map'),
            intro: "This is the map — we'll show you how to control the map next."
          },
          {
            element: document.querySelector('#drag-handle'),
            intro: "You can change how much of the overlay map is shown by dragging this handle in or out."
          },
          {
            title: 'Controlling the map',
            element: document.querySelector('#map-controls'),
            intro: 'Clicking this panel will allow you to change the view type and gives you access to the "Search places" and "Find my location" button. In addition to the zoom in/out buttons, you can also zoom using the scroll wheel on a mouse or by zooming on your phone.'
          },
          {
            title: 'Exploring Layers!',
            element: document.querySelector('#layer-controls'),
            intro: `By clicking on this panel, you can change what layers are available for the location you're seeing on the screen. In addition to changing the overlay layer, you can also change the base layer to help show how a place changed between two years.`
          },
          {
            title: 'Research this location',
            element: document.querySelector('#research-controls'),
            intro: `If you open this panel, you'll be able to annotate maps with observations, stories, or facts and you can also search for other maps and images that are somehow related to the area shown on your screen.`
          },
          {
            title: 'Share Atlascope',
            element: document.querySelector('#share-controls'),
            intro: `If you find a view that you'd like to share, you can do it by clicking this control panel and clicking "Copy".`
          },
          {
            title: 'Happy Atlascope-ing!',
            intro: `That's it — we hope you find Atlascope useful. To learn more about Atlascope, <a "target=_blank" href="https://www.leventhalmap.org/projects/digital-projects/atlascope/">visit our website</a>.`
          },
          
        ]
      });
      intro.onbeforechange(function () {
        if (this._currentStep === 5) {
          splashButton({action: "start"});
        }
      });
      intro.start();
  }

</script>

<section id="splash" class="ui-top-level-layer">
  <div id="splash-inner">
      
      {#if !$appState.gateway}
        <div class="my-3">
          <button
            class="text-xl"
            on:click={() => {
              dispatch("closeSelf");
            }}><Fa icon={faChevronUp} /></button
          >
        </div>
      {/if}
      <div class="p-0 mx-auto w-48 mb-3">
        <AtlascopeLogo pulse={true} />
      </div>
      <p class="text-xs md:text-sm mb-2">
        <strong>Atlascope {instanceVariables.name}</strong>
        {instanceVariables.tagline}.
      </p>
      <p class="text-xl font-bold">How do you want to start exploring?</p>
      {#if !$appState.layersLoaded}
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
              id = {button.id}
              on:click={() => {
                splashButton({action: button.id});
              }}
              disabled={!$appState.layersLoaded}
            />
          {/each}
        </div>
      </div>
      <div>
        <p class="font-semibold">
          Currently serving <span
            class="bg-yellow-900 text-gray-200 text-s font-semibold mx-0.5 px-2.5 py-0.5 rounded"
            >{$allLayers.length > 0 ? $allLayers.length : "..."}</span
          >
          atlas layers of {instanceVariables.geographicCoverage}
        </p>
      </div>
      {#if $appState.layersLoaded && instanceVariables.coverageDescriptiveList}
        <div class="py-3">
          <div class="relative inline-block text-left">
            <div>
              <button
                type="button"
                class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
                on:click={()=>{coverageDescriptiveListMenuPopFlag = !coverageDescriptiveListMenuPopFlag}}
              >
                Coverage area includes ...
                <svg
                  class="mr-1 h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {#if coverageDescriptiveListMenuPopFlag}
              <div
                class="absolute max-h-32 overflow-y-scroll left-0 max-sm:bottom-8 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabindex="-1"
              >
                <div class="py-1" role="none">
                  {#each instanceVariables.coverageDescriptiveList as coverageLocation}
                    <a
                      on:click="{()=>{ coverageDescriptiveListMenuPopFlag = false; splashButton({'action': 'jumpToCoverageLocation', 'center': coverageLocation.center }) }}"
                      class="text-gray-700 block px-4 py-2 text-sm hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                      role="menuitem"
                      tabindex="-1"
                      id="menu-item-0">{coverageLocation.name}</a
                    >
                  {/each}
                </div>
              </div>
            {/if}
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
      <div class="my-3">
        <LightIconButton
          icon={faPersonCircleQuestion}
          label="Help"
          size="sm"
          on:click={() => {
            startHelpIntro()
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
