<script>
  import Fa from "svelte-fa";
  import {
    faCircleArrowRight,
    faSearchLocation,
  } from "@fortawesome/free-solid-svg-icons";

  import { createEventDispatcher } from "svelte";

  import ModalCloserButton from "./ModalCloserButton.svelte";

  import instanceVariables from "../config/instance.json";
  import { insideChecker } from "./helpers/intersector";

  let dispatch = createEventDispatcher();
  let searchText = "";
  let results = [];
  let selected = -1;
  let showDropdown = false;
  let atlasExtentsGeometry; // = $state(false);

  let key = instanceVariables.geocodeKey;

  let debounceTimer;
  function debounceSearch(e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      executeSearch(e.target.value);
    }, 600);
  }

  async function executeSearch(value) {
    if (atlasExtentsGeometry) {
      if (value.length < 3) {
        results = [];
        showDropdown = false;
        return;
      }
    }
    const bbox = '-73.508,41.237,-69.928,42.886'
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=${key}&limit=10&bbox=${bbox}&country=us`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const candidates = data.features || [];
      console.log(candidates.length);

      candidates.forEach((c) => {
        filterFunction(c, atlasExtentsGeometry);
      });

      showDropdown = results.length > 0;
    } catch (err) {
      console.error("Geocoding error:", err);
      results = [];
      showDropdown = false;
    }
  }

  function filterFunction(c, ag) {
    let point = c.geometry.coordinates;
    if (insideChecker(point, ag)) {
      results.push(c);
    }
  }

  // load this once, and we'll prevent search from occuring before it's loaded
  fetch(instanceVariables.footprintsDissolved)
    .then((d) => d.json())
    .then((d) => {
      atlasExtentsGeometry = d.features[0].geometry;
    });

  function handleSelection(result, atlasExtentsGeometry) {
    const [lon, lat] = result.geometry.coordinates;
    dispatch("goToCoords", {
      lon: lon,
      lat: lat,
    });
    searchText = result.place_name || result.properties.name;
    showDropdown = false;
    results = [];
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
          on:input={debounceSearch}
          bind:value={searchText}
          on:keydown={handleKeydown}
        />
      </div>
      {#if showDropdown}
        <div>
          <ul>
            {#each results as result}
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
                {result.place_name || result.properties.name}
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
