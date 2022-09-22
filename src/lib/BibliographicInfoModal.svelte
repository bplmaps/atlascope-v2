<script>
  import Fa from "svelte-fa";
  import {
    faBookBookmark,
  } from "@fortawesome/free-solid-svg-icons";
  
  import { createEventDispatcher } from "svelte";
  import SvelteMarkdown from "svelte-markdown";

  let dispatch = createEventDispatcher();

  import ModalCloserButton from "./ModalCloserButton.svelte";

  export let base, overlay;

  let blocks = [{title: "Base Layer", p: base}, {title: "Overlay Layer", p: overlay}]

</script>

<section id="bibliographic-info-modal">
  <div class="modal-outer">
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold">
        <Fa icon={faBookBookmark} class="inline mr-2" />Bibliographic information
      </h1>

      {#each blocks as block}
      <div class="p-3 m-2 bg-gray-50 rounded">

      <h2 class="text-lg text-gray-800 font-semibold">{block.title}</h2>

      <p><SvelteMarkdown source={block.p.bibliographicEntry} /></p>
      <p class="my-3">
        {#if block.p.catalogPermalink}<a href="{block.p.catalogPermalink}" target="_blank" class="bg-blue-800 hover:bg-blue-900 text-gray-100 text-sm px-3 py-2 rounded">Catalog Record</a>{/if}

      </p>

    </div>

      {/each}



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
