<script>
  // Persistent on-map badge for loaded dataConnector data. Appears as soon as a
  // query is triggered (showing a spinner + disabled buttons) and switches to
  // the point count once the request returns. Split into its own component and
  // lazy-loaded by Map.svelte.
  import { mapState } from "../state.svelte.js";
  import { clearScratchData, reloadScratchData } from "../map/mapActions.js";

  let reloadEnabled = $derived(
    !mapState.scratchLoading && mapState.scratchReloadAvailable,
  );
</script>

{#if mapState.activeDataConnectorName}
  <div
    class="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-white/95 text-indigo-900 py-2 px-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-3"
  >
    {#if mapState.scratchLoading}
      <span class="font-semibold text-sm flex items-center gap-2">
        <svg
          class="animate-spin h-4 w-4 text-indigo-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Loading data from {mapState.activeDataConnectorName} …
      </span>
    {:else}
      <span class="font-semibold text-sm">
        {mapState.scratchPointCount} point{mapState.scratchPointCount === 1
          ? ""
          : "s"} displayed from {mapState.activeDataConnectorName}
      </span>
    {/if}

    <button
      class="bg-indigo-700 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-indigo-800 cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
      disabled={mapState.scratchLoading}
      onclick={() => clearScratchData()}>Clear data</button
    >
    <button
      class="rounded px-3 py-1 text-sm font-semibold {reloadEnabled
        ? 'bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
      disabled={!reloadEnabled}
      onclick={() => reloadScratchData(mapState.extent)}
      >Reload data for this area</button
    >
  </div>
{/if}

<style>
</style>
