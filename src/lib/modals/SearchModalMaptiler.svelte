<script module>
  // The dissolved-footprints GeoJSON sets both the geocoder's query bbox and
  // the polygon its results are filtered by; the modal is re-mounted on every
  // open, so cache the fetch at module level to load it once per session
  let coveragePromise;
</script>

<script>
  import Fa from "svelte-fa";
  import {
    faCircleArrowRight,
    faSearchLocation,
  } from "@fortawesome/free-solid-svg-icons";

  import instanceVariables from "../../config/instance.json";
  import bbox from "@turf/bbox";
  import { insideChecker } from "../helpers/intersector";

  import { appState, mapState } from "../state.svelte.js";
  import { applyMapState } from "../map/mapActions.js";

  let searchText = $state("");
  let results = $state([]);
  let selected = -1;
  let coverageError = $state(false);
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
    if (value.length < 3) {
      results = [];
      return;
    }
    let coverage;
    try {
      coverage = await coveragePromise;
    } catch {
      return;
    }
    const mapTilerPlaceTypes =
      "joint_municipality,joint_submunicipality,municipality,municipal_district,locality,neighbourhood,place,postal_code,address,road,poi";
    // The coverage bbox caps the query region; country narrows results
    // further and is omitted when the instance doesn't set it
    const countryParam = instanceVariables.geocoder.country
      ? `&country=${instanceVariables.geocoder.country}`
      : "";
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=${key}&types=${encodeURIComponent(mapTilerPlaceTypes)}&limit=10&bbox=${coverage.bbox.join(",")}${countryParam}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const candidates = data.features || [];
      candidates.forEach((candidate) => {
        let point = candidate.geometry.coordinates;
        if (insideChecker(point, coverage.geometry)) {
          results.push(candidate);
        }
      });
    } catch (err) {
      console.error("Geocoding error:", err);
      results = [];
    }
  }

  // A failed load is dropped from the cache so the next open retries it
  coveragePromise ??= fetch(instanceVariables.footprintsDissolved)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((d) => {
      const geometry = d.geometries[0];
      return { geometry, bbox: bbox(geometry) };
    });

  coveragePromise.catch((err) => {
    console.error("Coverage footprint load error:", err);
    coverageError = true;
    coveragePromise = null;
  });

  function handleSelection(result) {
    const [lon, lat] = result.geometry.coordinates;
    applyMapState({
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
      {#if coverageError}
        <div>
          <i class="text-gray-700 text-sm ml-2"
            >Search is unavailable right now. Please try again later.</i
          >
        </div>
      {:else if results && results.length > 0}
        <div>
          <ul>
            {#each results as result (result.id || result.place_name)}
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
