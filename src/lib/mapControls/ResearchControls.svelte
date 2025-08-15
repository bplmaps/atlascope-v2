<script>

  import LightIconButton from "../ui/LightIconButton.svelte";
  import { faPenToSquare, faMapPin, faMagnifyingGlassArrowRight } from "@fortawesome/free-solid-svg-icons";
  import { mapState } from "../state.svelte.js";
  import { bboxFunctions } from "../../config/research-connections.js";
  
</script>

<div>
  <h2 class="md:hidden text-xl font-bold mb-2">Research</h2>
  <div class="flex flex-wrap">
    <LightIconButton
      label="Annotate map"
      icon={faPenToSquare}
      on:click={() => {
        mapState.annotationEntry = true;
      }}
    />
    <LightIconButton
      label="Load annotations"
      icon={faMapPin}
      on:click={() => {
        mapState.annotationRead = true;
      }}
    />

    {#each bboxFunctions as f}
    {#if f.name != "Search postcards here"}
      <LightIconButton
        label={f.name}
        icon={faMagnifyingGlassArrowRight}
        on:click={() => {
          let url = f.searchFunction(mapState.extent);
          window.open(url);
        }}
      />
      {/if}
    {/each}
  </div>
</div>

<style>
</style>
