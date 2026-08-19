<script>
  import LightIconButton from "../ui/LightIconButton.svelte";
  import ResearchDropupMenu from "./ResearchDropupMenu.svelte";
  import {
    faPenToSquare,
    faMapPin,
    faMagnifyingGlassArrowRight,
  } from "@fortawesome/free-solid-svg-icons";
  import { mapState } from "../state.svelte.js";
  import { loadScratchData } from "../map/mapActions.js";
  import {
    searchConnectors,
    dataConnectors,
  } from "../../config/research-connections.js";
  import { annotationsEnabled } from "../../config/features.js";

  // Which dropup menu is open ("search" | "data" | null). Owned here so that
  // opening one menu closes the other.
  let openMenu = $state(null);
  const toggleMenu = (id) => {
    openMenu = openMenu === id ? null : id;
  };

  // Opens the external web app for a search connector, using the map extent
  // (bbox) or center (centerpoint) depending on the connector's queryType.
  function runSearch(connector) {
    const geo =
      connector.queryType === "centerpoint" ? mapState.center : mapState.extent;
    if (!geo) return;
    window.open(connector.urlFunction(geo));
  }

  // Loads a data connector's points onto the scratch layer. Count/clear/reload
  // are surfaced by the persistent on-map badge, not here.
  function runLoad(connector) {
    if (!mapState.extent) return;
    loadScratchData(connector, mapState.extent);
  }
</script>

<div>
  <h2 class="md:hidden text-xl font-bold mb-2">Research</h2>

  <div class="flex flex-wrap items-start gap-2">
    {#if annotationsEnabled}
      <LightIconButton
        label="Annotate map"
        icon={faPenToSquare}
        onclick={() => {
          mapState.annotationEntry = true;
        }}
      />
      <LightIconButton
        label="Load annotations"
        icon={faMapPin}
        onclick={() => {
          mapState.annotationRead = true;
        }}
      />
    {/if}

    {#if searchConnectors.length > 0}
      <ResearchDropupMenu
        triggerLabel="Search this location for …"
        items={searchConnectors}
        onSelect={runSearch}
        icon={faMagnifyingGlassArrowRight}
        open={openMenu === "search"}
        onToggle={() => toggleMenu("search")}
      />
    {/if}

    {#if dataConnectors.length > 0}
      <ResearchDropupMenu
        triggerLabel="Load data from …"
        items={dataConnectors}
        onSelect={runLoad}
        icon={faMagnifyingGlassArrowRight}
        open={openMenu === "data"}
        onToggle={() => toggleMenu("data")}
      />
    {/if}
  </div>
</div>

<style>
</style>
