<script>
  import Fa from "svelte-fa";
  import instanceVariables from "../../config/instance.json";
  import {
    faPenToSquare,
    faUpRightFromSquare,
    faCopy,
  } from "@fortawesome/free-solid-svg-icons";
  import { appState, mapState } from "../state.svelte.js";
  let { annotationsList, closeAnnotationListModal, moveMapToAnnotation } =
    $props();

  let activeAnnotation = $state(null);
  let shareUrl = $state("");

  function copyURL(a) {
    appState.annotation.id = a.id;
    console.log(appState);
    let shareUrl = `${instanceVariables.baseURL}/#/view:annotation$annotation:${a.id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        window.alert(`Link to digital postcard copied to clipboard!`);
      })
      .catch(() => {
        alert("Something went wrong in copying this URL.");
      });
  }
</script>

<div class="bg-white absolute rounded shadow bottom-3 left-2 right-2">
  <div class="flex flex-col">
    <div class="p-3 rounded bg-gray-100">
      <Fa icon={faPenToSquare} class="inline mr-2" /><span class="font-bold">
        Annotations from other users</span
      >
      <p class="text-sm mt-2 text-gray-500">
        Click an annotation to see its map location
      </p>
    </div>

    <div class="max-h-28 lg:max-h-44 overflow-y-scroll">
      {#each annotationsList as a, i}
        <div
          aria-hidden="true"
          class="flex flex-row py-2 px-3 border-t border-gray-400 text-sm hover:bg-amber-50 text-gray-600 hover:text-gray-900 cursor-pointer {activeAnnotation ===
          i
            ? 'bg-amber-100'
            : 'truncate'}"
          onclick={() => {
            activeAnnotation = i;
            moveMapToAnnotation(i, 1000);
          }}
        >
          <button
            class="ml-2 flex items-center text-sm hover:cursor-pointer hover:text-blue-700"
            onclick={() => copyURL(a)}
            ><Fa icon={faCopy} class="inline" /><span
              class="md:inline ml-1 hidden"></span
            >
          </button>
          <a
            class="ml-2 flex items-center text-sm hover:cursor-pointer hover:text-blue-700"
            href="/#/view:annotation$annotation:${a.id}"
            target="_blank"
            ><Fa icon={faUpRightFromSquare} class="inline" /><span
              class="md:inline ml-1 hidden"></span
            >
        </a>
          <div class="px-3 flex">
            <input
              class="hidden"
              type="text"
              id="share-app-url"
              value={shareUrl}
              readonly
            />
          </div>

          <p class="text-left mx-1">{a.body}</p>
        </div>
      {/each}
    </div>

    <div class="p-3 bg-gray-100 flex">
      <button
        onclick={() => {
          mapState.annotationRead = true;
        }}
        class="bg-blue-500 p-2 text-sm font-semibold rounded text-white"
        >Reload annotations here</button
      >
      <button
        onclick={closeAnnotationListModal}
        class="border-amber-800 text-amber-800 text-sm p-2 ml-2 border rounded"
        >Close</button
      >
    </div>
  </div>
</div>

<style>
</style>
