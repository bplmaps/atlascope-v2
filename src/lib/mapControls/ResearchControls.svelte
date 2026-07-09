<script>

  import LightIconButton from "../ui/LightIconButton.svelte";
  import { faPenToSquare, faMapPin, faMagnifyingGlassArrowRight } from "@fortawesome/free-solid-svg-icons";
  import { mapState } from "../state.svelte.js";
  import { bboxFunctions } from "../../config/research-connections.js";
  import { annotationsEnabled } from "../../config/features.js";
  
</script>

<div>
  <h2 class="md:hidden text-xl font-bold mb-2">Research</h2>
  <div class="flex flex-wrap">
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

    {#each bboxFunctions as f}
      <LightIconButton
        label={f.name}
        icon={faMagnifyingGlassArrowRight}
        hideableOnMobile={f.hiddenOnMobile}
        onclick={() => {
          let url = f.searchFunction(mapState.extent);
          window.open(url);
        }}
      />
    {/each}
  </div>
</div>

<style>
</style>
