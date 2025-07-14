<script>
  import Fa from "svelte-fa";

  import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
  let { annotationsList, closeAnnotationListModal, moveMapToAnnotation } = $props();

  let activeAnnotation = $state(null);
  import { mapState } from "../state.svelte.js";


</script>

<div class="bg-white absolute rounded shadow bottom-3 left-2 right-2">
  <div class="flex flex-col">
  <div class="p-3 rounded bg-gray-100">  <Fa icon={faPenToSquare} class="inline mr-2" /><span class="font-bold">
    Annotations from other users</span>
    <p class="text-sm mt-2 text-gray-500">Click an annotation to see its map location</p>
  </div>


    <div class="max-h-28 lg:max-h-44 overflow-y-scroll">
    {#each annotationsList as a, i}

    <div class="py-2 px-3 border-t text-sm hover:bg-amber-50 text-gray-600 hover:text-gray-900 cursor-pointer {activeAnnotation===i ? 'bg-amber-100' : 'truncate'}" on:click={()=>{activeAnnotation=i; moveMapToAnnotation(i)} }>{a.body}</div>

    {/each}
    </div>

    <div class="p-3 bg-gray-100 flex">
      <button on:click="{()=>{mapState.annotationRead = true}}" class="bg-blue-500 p-2 text-sm font-semibold rounded text-white">Reload annotations here</button>
      <button on:click="{closeAnnotationListModal}" class="border-amber-800 text-amber-800 text-sm p-2 ml-2 border rounded">Close</button>
    </div>
  </div>

</div>

<style>
</style>
