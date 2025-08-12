<script>
  import { mapState, appState } from "../state.svelte.js";

  import LayerChooserDropupMenu from "./LayerChooserDropupMenu.svelte";
  import LightIconButton from "../ui/LightIconButton.svelte";
  import Fa from "svelte-fa";
  import { faBookBookmark, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
</script>

<h2 class="md:hidden text-xl font-bold mb-2">Atlases</h2>
<div class="flex max-w-full flex-wrap items-center gap-2">
  <div>
    <LayerChooserDropupMenu
      layerName={mapState.viewMode === "glass" ? "base" : "overlay"}
    />
  </div>
  <div>
    <LayerChooserDropupMenu
      layerName={mapState.viewMode === "glass" ? "overlay" : "base"}
    />
  </div>

  <div>
    <LightIconButton
      label="Bibliographic information"
      icon={faBookBookmark}
      on:click={() => {
        appState.modals.biblio = true;
      }}
    />
  </div>

  <div>
    <div class="group relative inline-flex w-15 shrink-0 rounded-full bg-gray-200 p-1 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-gray-600 transition-colors duration-200 ease-in-out has-checked:bg-gray-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-gray-500 dark:has-checked:bg-gray-500">
      <span class="relative size-8 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5">
        <span aria-hidden="true" class="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in group-has-checked:opacity-0 group-has-checked:duration-100 group-has-checked:ease-out">
          <Fa icon={faLockOpen} />
        </span>
        <span aria-hidden="true" class="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-has-checked:opacity-100 group-has-checked:duration-200 group-has-checked:ease-in">
          <Fa icon={faLock} />
        </span>
      </span>
      <input type="checkbox" name="setting" aria-label="Use setting" class="absolute inset-0 appearance-none focus:outline-hidden" checked={mapState.lockLayers} onclick={() => {
        mapState.lockLayers = !mapState.lockLayers;
      }} />
    </div>
  </div>
</div>
