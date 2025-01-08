<script>
  import Fa from "svelte-fa";
  import {
    faCircleArrowRight,
    faCropSimple,
    faSearchLocation,
  } from "@fortawesome/free-solid-svg-icons";
  
  import { createEventDispatcher } from "svelte";

  import ModalCloserButton from "./ModalCloserButton.svelte";

  import instanceVariables from "../config/instance.json";

  // ITS: import insideChecker

  import { insideChecker } from "./helpers/intersector";
  
  import { Log } from "faunadb";

  let dispatch = createEventDispatcher();

  // ITS: instantiate some new variables, including
  // `arr` for holding filtered results;
  // `filtered` for holding the `arr`;
  // `inside` for holding the status of the
  // `insideChecker` results; and
  // `volumePoly` for holding the dissolved extents geometry

  let debounceTimer;
  let searchResults;
  let arr;
  let filtered;
  let inside;
  let volumePoly;
  let searchText = "";

  function debounceSearch(e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      executeSearch(e.target.value);
    }, 100);
  }

  function executeSearch(searchString) {
    fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${searchString}&f=json&searchExtent=${instanceVariables.maxExtent.join(",")}`)
      .then((d) => d.json())
      .then((d) => {
        console.log(searchResults)
        console.log('execute search: define search results globally')
        searchResults = d;
        filter(searchResults)
      });
  }

  // ITS: filter function which will take search results as its argument

  function filter(sr) {
    filtered=[]
    console.log("filter")
    for (const s in sr.suggestions) {
      fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?&magicKey="${sr.suggestions[s].magicKey}"&f=json`)
      .then((d) => d.json())
      .then((d) => {
        let point = d.candidates[0].location
        inside = insideChecker(point, volumePoly)
        if (inside === false) {
          sr.suggestions.pop()
        } else {
        }
        filtered=sr.suggestions
      })
    }
  }

  // ITS: fetch polygon data

  function getVolumesPoly() {
    return fetch(instanceVariables.footprintsDissolved)
      .then((d) => d.json())
      .then((d) => {
        const r = d.features[0].geometry
        volumePoly=r
      })
    }

  function handleSelection(d) {
    searchResults = null;
    searchText = d.text;
    fetch(
      `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?&magicKey="${d.magicKey}"&f=json`
    )
      .then((d) => d.json())
      .then((d) => {
        if (d.candidates.length > 0) {
          dispatch("goToCoords", {
            lon: d.candidates[0].location.x,
            lat: d.candidates[0].location.y,
          });
        }
      });
  }
</script>

<section id="search-modal">

  <!-- ITS: func to get poly data; just hang on to it globally for now -->

  {getVolumesPoly()}
  <div class="modal-outer">
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold">
        <Fa icon={faSearchLocation} class="inline mr-2" />Search places
      </h1>
      <p class="text-sm font-light">
        This form will search modern addresses and locations.
      </p>

      <div class="my-4">
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          id="search-input"
          type="text"
          placeholder="Enter address or location ..."
          on:input={debounceSearch}
          bind:value={searchText}
        />
      </div>

      {#if searchResults && searchResults.suggestions && searchResults.suggestions.length > 0}
        <div>
          <ul>

            <!-- ITS: loop `filtered` list -->

            {console.log(searchResults)}
            {#each filtered as result}
              <li
                class="text-gray-700 ml-2 mb-1 cursor-pointer text-md hover:text-red-900 group"
                on:click={() => {
                  handleSelection(result);
                }}
              >
                <Fa
                  icon={faCircleArrowRight}
                  class="mr-1 inline text-sm text-slate-100 group-hover:text-red-900"
                />
                {result.text}
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <ModalCloserButton
        on:click={() => {
          dispatch("closeSelf");
        }}
      />
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
