<script>

    import {createEventDispatcher} from 'svelte';

    import Fa from "svelte-fa";
    import {
        faLocationArrow,
        faSearchLocation,
        faHiking,
        faLandmark,
    } from "@fortawesome/free-solid-svg-icons";

    const dispatch = createEventDispatcher();

    import { allLayers } from './stores.js';
    import { appState } from './stores.js';

    export let instanceVariables;

    function splashButton(b) {
        dispatch('splashButton',{'action': b})
    }

    let buttons = [
      {"id": "find", "text": "Find my location", "icon": faLocationArrow},
      {"id": "search", "text": "Search places", "icon": faSearchLocation},
      {"id": "tour", "text": "Take a tour", "icon": faHiking},
      {"id": "start", "text": `Start at ${instanceVariables.defaultStartLocation.name}`, "icon": faLandmark}
    ]

</script>


<section id="splash" class="ui-top-level-layer">
    <div id="splash-inner">
      <p class="text-m"><strong class="has-background-primary has-text-white-ter p-1">Atlascope {instanceVariables.name}</strong> {instanceVariables.tagline}.</p>
      <p class="text-xl font-bold">How do you want to start exploring?</p>

      {#if !$appState.layersLoaded}
      <div class="grid place-items-center mt-3">
        <div>
          <svg aria-hidden="true" class="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
        <div class="text-gray-500">
          Loading map data
        </div>
      </div>
      {/if}



      <div class="my-5">
        {#each buttons as button}
        <button class="mr-2 mb-2 drop-shadow hover:ring-slate-300 transition-all" class:bg-blue-100={!$appState.layersLoaded} disabled={!$appState.layersLoaded}  on:click="{()=>{splashButton(button.id)}}"><Fa icon={button.icon} class="inline mr-2" />{button.text}</button>
        {/each}
        </div>

      <div>
        <p class="font-semibold">Currently serving <span class="bg-yellow-900 text-gray-200 text-s font-semibold mx-0.5 px-2.5 py-0.5 rounded">{$allLayers.length > 0 ? $allLayers.length : "..."}</span> atlas layers of {instanceVariables.geographicCoverage}</p>
      </div>

      <div>
        <p class="font-light text-sm mt-5">A project of {instanceVariables.institutionalSponsor}</p>
      </div>
    </div>
</section>



<style>


  section#splash {
    background-color: rgba(255,255,255,0.93);
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
  }

  #splash-inner {
    padding: 30px; 
    text-align: center;
  }




</style>
