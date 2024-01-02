<script>
    import Fa from "svelte-fa";
    import ViewModeDropupMenu from "./ViewModeDropupMenu.svelte";
    import {
        faMinus,
        faPlus,
        faRotateRight,
    } from "@fortawesome/free-solid-svg-icons";

    export let mapState;
    export let changeMapView;
</script>

<div>
    <div class="flex max-w-full flex-wrap">
        <div class="mr-4">
            <ViewModeDropupMenu
                chosen={mapState.viewMode}
                on:selectionMade={(d) => {
                    mapState.viewMode = d.detail.id;
                }}
            />
        </div>

        <div class="mt-1 mr-3 inline-flex rounded-md shadow-sm" role="group">
            <button
                on:click={() => {
                    changeMapView({ zoom: +mapState.zoom + 1.0 });
                }}
                type="button"
                class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
            >
                <Fa icon={faPlus} />
            </button>
            <button
                on:click={() => {
                    changeMapView({ zoom: +mapState.zoom - 1.0 });
                }}
                type="button"
                class="py-2 px-4 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
            >
                <Fa icon={faMinus} />
            </button>
            <button
                on:click={() => {
                    changeMapView({ rotate: true });
                }}
                type="button"
                class="py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-r-md border border-gray-300 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
            >
                <Fa icon={faRotateRight} />
            </button>
            
        </div>
    </div>
</div>
