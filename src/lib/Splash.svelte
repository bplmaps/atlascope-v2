<script>

    import {createEventDispatcher} from 'svelte';

    import Fa from "svelte-fa";
    import {
        faLocationArrow,
        faSearchLocation,
        faHiking,
        faLandmark,
    } from "@fortawesome/free-solid-svg-icons";

    const dispatcher = createEventDispatcher();

    export let instanceVariables;
    export let availableLayers;

    function splashButton(b) {
        dispatcher('splashButton',{'action': b})
    }

</script>


<section id="splash" class="ui-top-level-layer">
    <div id="splash-inner">
      <p class="text-m"><strong class="has-background-primary has-text-white-ter p-1">Atlascope {instanceVariables.name}</strong> {instanceVariables.tagline}.</p>
      <p class="is-size-3 my-4 teaser">How do you want to start exploring?</p>

      <div class="my-5">
      <button on:click="{()=>{splashButton('find')}}"><Fa icon={faLocationArrow} class="inline mr-2" />Find my location</button>
      <button on:click="{()=>{splashButton('search')}}"><Fa icon={faSearchLocation} class="inline mr-2" />Search places</button>
      <button on:click="{()=>{splashButton('tour')}}"><Fa icon={faHiking} class="inline mr-2" />Take a tour</button>
      <button on:click="{()=>{splashButton('start')}}"><Fa icon={faLandmark} class="inline mr-2" />Start at {instanceVariables.defaultStartLocation.name}</button>
      </div>

      <div>
        <p class="has-text-weight-semibold">Currently serving <span class="bg-gray-800 text-gray-200 text-s font-semibold mx-0.5 px-2.5 py-0.5 rounded">{availableLayers > 0 ? availableLayers : "..."}</span> atlas layers of {instanceVariables.geographicCoverage}</p>
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

  .teaser {
    font-weight: 800;
  }

</style>
