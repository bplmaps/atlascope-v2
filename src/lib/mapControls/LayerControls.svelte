<script>
    import { mapState, appState } from "../state.svelte.js";

    import LayerChooserDropupMenu from "./LayerChooserDropupMenu.svelte";
    import LightIconButton from "../ui/LightIconButton.svelte";

    import { faBookBookmark } from "@fortawesome/free-solid-svg-icons";


</script>
<h2 class="md:hidden text-xl font-bold mb-2">Atlases</h2>
      <div class="flex max-w-full flex-wrap">
        {#if mapState.viewMode === "glass"}
        <div class="mr-4">
            <LayerChooserDropupMenu
            layerName="base"
          />
        </div>
        <div class="mr-4">
          <LayerChooserDropupMenu
            layerName="overlay"
          />
        </div>
        {:else}
        <div class="mr-4">
          <LayerChooserDropupMenu
            layerName="overlay"
          />
        </div>
        <div class="mr-4">
            <LayerChooserDropupMenu
            layerName="base"
          />
        </div>
        {/if}
        <div>
          <LightIconButton
            label="Bibliographic information"
            icon={faBookBookmark}
            on:click={() => {
              appState.modals.biblio = true;
            }}
          />
        </div>
      </div>