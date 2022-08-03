<script>

    import { createEventDispatcher } from "svelte";

    export let choices;
    export let chosen;
    export let label;

    let poppedFlag = false;

    let dispatch = createEventDispatcher();

    function handleSelection(id) {
        poppedFlag = false;
        dispatch('selectionMade',{"id": id});
    }

</script>


<div>
    <div class="mt-1 relative">
      <button type="button" on:click={()=>{poppedFlag = !poppedFlag}} class="relative bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
        <span class="flex items-center">
            <span class="text-gray-500 mr-2 font-light text-lg">{label}</span>
          <span class="ml-1 block truncate text-gray-900 text-lg">{chosen}</span>
        </span>
        <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>
  
      <ul class:hidden="{!poppedFlag}" class="absolute bottom-12 z-10 mt-1 bg-white shadow-lg max-h-64 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabindex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">

        {#each choices as choice }
        <li class="text-gray-800 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:text-red-900" id="base-layer-option-" role="option"
            on:click={()=>{handleSelection(choice.id)}}>
          <div class="flex items-center">
            <span class="font-normal font-bold ml-1 mr-2 block truncate">{choice.title}</span> <span class="text-xs">{choice.subtitle}</span>
          </div>
        </li>
        {/each}
  
      </ul>
    </div>
  </div>

  <style>

  </style>