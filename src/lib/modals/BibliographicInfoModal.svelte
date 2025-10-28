<script>
  import Fa from "svelte-fa";
  import { faBookBookmark, faCopy } from "@fortawesome/free-solid-svg-icons";

  import SvelteMarkdown from "svelte-markdown";
  import TileJsonUrlFetcher from "../helpers/TileJsonUrlFetcher.svelte";

  import { mapState, allLayers, referenceLayers } from "../state.svelte.js";
  import instanceVariables from "../../config/instance.json";

  const getLayerDataById = (id) => {
    return allLayers.layers.find((l) => l.properties.identifier === id) ? allLayers.layers.find((l) => l.properties.identifier === id) : referenceLayers.layers.find((l) => l.properties.identifier === id);
  }

  const blocks = $derived.by(() => [
    { title: "Overlay Layer", p: getLayerDataById(mapState.layers.overlay.id).properties },
    { title: "Base Layer", p: getLayerDataById(mapState.layers.base.id).properties }
  ]);

</script>

<section id="bibliographic-info-modal">
  <div class="modal-outer">
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold">
        <Fa icon={faBookBookmark} class="inline mr-2" />Bibliographic
        information
      </h1>

      {#each blocks as block}
        <div class="p-3 m-2 bg-gray-50 rounded">
          <h2 class="text-lg text-gray-800 font-semibold">{block.title}</h2>
          <p><SvelteMarkdown source={block.p.bibliographicEntry} /></p>

          {#if block.p.sponsors && block.p.sponsors.length > 0}
          <p class="my-3">
            <span class="font-semibold">Sponsors</span>

          {#each block.p.sponsors as sponsor}

              <a class="bg-indigo-50 px-2 py-1 rounded text-xs" href={sponsor.url} target='blank'>{sponsor.name}</a>
            {/each}

          </p>{/if}

          {#if block.p.heldBy}
          <p class="my-3">
            <span class="font-semibold">Held by</span>

            {#each block.p.heldBy as holder}
            <span class="bg-indigo-50 px-2 py-1 rounded text-xs">{holder}</span>

            {/each}
          </p>{/if}
          {#if block.p.catalogPermalink}
            <p class="my-3">
              <a
                href={block.p.catalogPermalink}
                rel="noreferrer"
                target="_blank"
                class="a-button bg-blue-200 hover:bg-blue-900 text-gray-800 text-sm px-3 py-2 rounded transition-all hover:text-white"
                >Catalog Record</a
              >
            </p>
          {/if}

          {#if block.p.source && !block.p.source.hidden }
            <div class="my-3 p-2 bg-gray-200 rounded shadow-inner text-sm  overflow-x-auto">
              <div class="flex"><span class="font-semibold pr-3">Layer type </span><span class="font-mono text-gray-700">{block.p.source.type}</span></div>
              <div class="flex"><span class="font-semibold pr-3">Layer URL </span><span class="font-mono text-gray-700 whitespace-nowrap">{block.p.source.url}</span></div>
              {#if block.p.source.type === "tilejson" && block.p.source.url }
                <TileJsonUrlFetcher tileJsonUrl={block.p.source.url} />
              {/if}
            </div>
          {/if}
        </div>
      {/each}


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
