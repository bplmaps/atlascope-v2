<script>
  import Fa from "svelte-fa";
  import { faBookBookmark, faCopy } from "@fortawesome/free-solid-svg-icons";

  import { createEventDispatcher } from "svelte";
  import { onMount } from 'svelte';

  import SvelteMarkdown from "svelte-markdown";

  let dispatch = createEventDispatcher();

  import ModalCloserButton from "./ModalCloserButton.svelte";

  export let base, overlay;

  let blocks = [
    { title: "Base Layer", p: base },
    { title: "Overlay Layer", p: overlay },
  ];

  let d;
  let showPopup = false;

  onMount(async () => {
    const r = await fetch(blocks[1].p.source.url);
    d = await r.json()
    console.log(d.tiles[0])
  })

  function copyToClipboard() {
    const textToCopy = d.tiles[0];

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showPopup = true;
        setTimeout(() => {
          showPopup = false;
        }, 2000);
      })
      .catch((error) => {
        console.error('Error copying text to clipboard:', error);
      });
  }

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
                class="bg-blue-800 hover:bg-blue-900 text-gray-100 text-sm px-3 py-2 rounded"
                ><Fa icon={faBookBookmark} class="inline mr-2" />Catalog Record</a
              >
            </p>
          {/if}
          {#if block.p.source && !block.p.source.hidden && d}
          <p class="my-3">
            <button on:click={copyToClipboard}
              class="bg-blue-800 hover:bg-blue-900 text-gray-100 text-sm px-3 py-2 rounded"
              ><Fa icon={faCopy} class="inline mr-2" />Copy XYZ tiles to clipboard</button
            >
          </p>
          {/if}
          {#if showPopup}
            <div class="popup">
              <p>XYZ tile endpoint copied to clipboard!</p>
            </div>
          {/if}
          {#if block.p.source && !block.p.source.hidden && d}
            <div class="my-3 p-2 bg-gray-200 rounded shadow-inner text-sm  overflow-x-auto">
              <div class="flex"><span class="font-semibold pr-3">Layer type </span><span class="font-mono text-gray-700">{block.p.source.type}</span></div>
              <div class="flex"><span class="font-semibold pr-3">Layer URL </span><span class="font-mono text-gray-700 whitespace-nowrap">{block.p.source.url}</span></div>
              <!-- <div class="flex"><span class="font-semibold pr-3">XYZ </span><span class="font-mono text-gray-700 whitespace-nowrap">{d.tiles[0]}</span></div> -->
            </div>
          {/if}
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

  .popup {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffffff;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    opacity: 1;
    transition: opacity 0.5s ease;
    animation: fadeOut 2s forwards;
  }

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

</style>
