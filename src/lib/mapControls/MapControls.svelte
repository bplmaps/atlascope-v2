<script>
    import ViewModeDropupMenu from "./ViewModeDropupMenu.svelte";
    import LightIconButton from "../ui/LightIconButton.svelte";
    import Fa from "svelte-fa";
    import { faPlus, faMinus, faRotateRight, faSearchLocation, faLocationArrow, faArrowUp } from "@fortawesome/free-solid-svg-icons";

    import { mapState, appState } from "../state.svelte.js";
</script>

<div>
    <h2 class="md:hidden text-xl font-bold mb-2">Controls</h2>
      <div class="flex max-w-full flex-wrap">
        <div class="mr-4">
          <ViewModeDropupMenu />
        </div>

        <div class="mt-1 mr-3 inline-flex rounded-md shadow-sm" role="group">
          <button
            onclick={() => {
              mapState.zoom += 1;
            }}
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            <Fa icon={faPlus} />
          </button>
          <button
            onclick={() => {
              mapState.zoom -= 1;
            }}
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white border-t border-b border-r border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            <Fa icon={faMinus} />
          </button>
          <button
            onclick={() => {
              mapState.rotation = mapState.rotation + 0.5 * Math.PI;
            }}
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            <Fa icon={faRotateRight} />
          </button>
          <button
            onclick={() => {
              mapState.rotation = 0;
            }}
            type="button"
            class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            <Fa icon={faArrowUp} />
          </button>
        </div>

        <LightIconButton
          label="Search places"
          icon={faSearchLocation}
          on:click={() => {
            appState.modals.search = true;
          }}
        />
        <LightIconButton
          label="Find my location"
          icon={faLocationArrow}
          on:click={() => {
            appState.modals.geolocation = true;
          }}
        />
      </div>
</div>