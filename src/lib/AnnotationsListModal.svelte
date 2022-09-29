<script>
  import Fa from "svelte-fa";

  import { createEventDispatcher, onMount } from "svelte";
  import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
  export let annotationsList;

  let activeAnnotation;
  let dispatch = createEventDispatcher();

</script>

<div class="bg-white absolute rounded shadow top-2 right-2 w-1/3 max-h-2/3">
  <div class="flex flex-col max-h-full">
  <div class="p-3 bg-gray-100">  <Fa icon={faPenToSquare} class="inline mr-2" /><span class="font-bold">
    Annotations from other users</span>
    <p class="text-sm mt-2 text-gray-500">Click an annotation to see its map location</p>
  </div>


    <div class="overflow-scroll">
    {#each annotationsList as a, i}

    <div class="py-2 px-3 border-t text-sm hover:bg-amber-50 text-gray-600 hover:text-gray-900 cursor-pointer {activeAnnotation===i ? 'bg-amber-100' : null}" on:click={()=>{activeAnnotation=i; dispatch('moveMapToAnnotation',{'annotationIndex': i})} }>{a.data.body}</div>

    {/each}
    </div>

    <div class="p-3 bg-gray-100 flex">
      <button on:click="{()=>{dispatch('refreshAnnotations')}}" class="bg-blue-500 p-2 text-sm font-semibold rounded text-white">Reload annotations in view</button>
      <button on:click="{()=>{dispatch('closeAnnotationListModal')}}" class="border-amber-800 text-amber-800 text-sm p-2 ml-2 border rounded">Close</button>
    </div>
  </div>

</div>

<style>
</style>
