<script>
  import Fa from "svelte-fa";
  import {
    faCircleArrowRight,
    faSearchLocation,
  } from "@fortawesome/free-solid-svg-icons";

  import instanceVariables from "../../config/instance.json";
  import { insideChecker } from "../helpers/intersector";

  import { appState, mapState } from "../state.svelte";
  import { requestChangeToMapState } from "../helpers/mapHelpers.js";

  let searchText = $state("");
  let results = $state([]);
  let selected = -1;
  let atlasExtentsGeometry = $state(false);
  let key = instanceVariables.geocodeKey;
  let debounceTimer;

  async function debounceSearch(e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      results = []; // prevent results list from growing indefinitely
      executeSearch(e.target.value);
    }, 100);
  }

  async function executeSearch(value) {
    if (atlasExtentsGeometry) {
      if (value.length < 3) {
        results = [];
        return;
      }
    }
    const mapTilerPlaceTypes =
      "joint_municipality,joint_submunicipality,municipality,municipal_district,locality,neighbourhood,place,postal_code,address,road,poi";
    const bbox = "-73.508,41.237,-69.928,42.886"; // this sets a max extent of Massachusetts for the initial query
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=${key}&types=${encodeURIComponent(mapTilerPlaceTypes)}&limit=10&bbox=${bbox}&country=us`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const candidates = data.features || [];
      candidates.forEach((candidate) => {
        let point = candidate.geometry.coordinates;
        if (insideChecker(point, atlasExtentsGeometry)) {
          results.push(candidate);
        }
      });
    } catch (err) {
      console.error("Geocoding error:", err);
      results = [];
    }
  }

  // load this once, and we'll prevent search from occuring before it's loaded

  fetch(instanceVariables.footprintsDissolved)
    .then((d) => d.json())
    .then((d) => {
      atlasExtentsGeometry = d.geometries[0];
    });

  function handleSelection(result) {
    const [lon, lat] = result.geometry.coordinates;
    requestChangeToMapState(mapState, {
      center: [lon, lat],
      zoom: 17,
      dropPin: true,
    });
    searchText = result.place_name || result.properties.name;
    results = [];
    appState.modals.search = false;
  }

  function handleKeydown(e) {
    if (e.key === "ArrowDown") {
      selected = (selected + 1) % results.length;
    } else if (e.key === "ArrowUp") {
      selected = (selected - 1 + results.length) % results.length;
    } else if (e.key === "Enter" && selected >= 0) {
      handleSelection(results[selected]);
    }
  }
</script>

<section id="search-modal">
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
          oninput={debounceSearch}
          bind:value={searchText}
          onkeydown={handleKeydown}
        />
      </div>
      {#if results && results.length > 0}
        <div>
          <ul>
            {#each results as result}
              <li>
                <button
                  class="text-left text-gray-700 ml-2 mb-1 cursor-pointer text-md hover:text-red-900 group"
                  onclick={() => {
                    handleSelection(result);
                  }}
                >
                  <Fa
                    icon={faCircleArrowRight}
                    class="mr-1 inline text-sm text-slate-100 group-hover:text-red-900"
                  />
                  {result.place_name || result.properties.name}
                </button>
              </li>
            {/each}
          </ul>
        </div>

        <!-- suggesting a listener for 'no results' -->
      {:else if searchText.length > 4 && results.length === 0}
        <div>
          <ul>
            <li>
              <i class="text-gray-700 text-sm ml-2">No results found</i>
            </li>
          </ul>
        </div>
      {/if}
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
