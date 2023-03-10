<script>
  import { createEventDispatcher } from "svelte";

  let poppedFlag = false;

  let dispatch = createEventDispatcher();

  let choices = [
    {
      name: "Central Library & Copley Square",
      shareURL:
        "https://atlascope.org/#/view:share$mode:glass$center:-71.07681,42.34944$zoom:18.01$base:ark:/76611/al8c28hx3$overlay:ark:/76611/al7rtfm98",
    },
    {
      name: "Massachusetts State House",
      shareURL:
        "https://atlascope.org/#/view:share$mode:glass$center:-71.06374,42.35867$zoom:18.31$base:ark:/76611/al89922k7$overlay:ark:/76611/al7s13kaf",
    },
    {
      name: "South Station",
      shareURL:
        "https://atlascope.org/#/view:share$mode:glass$center:-71.05709,42.35067$zoom:17.08$base:ark:/76611/al8c28hx3$overlay:ark:/76611/al8c4ck7o",
    },
    {
      name: "East Boston & Logan Airport",
      shareURL:
        "https://atlascope.org/#/view:share$mode:glass$center:-71.03419,42.37063$zoom:15.75$base:maptiler-streets$overlay:ark:/76611/al8c3u1jq",
    },
    {
      name: "Back Bay Fens",
      shareURL:
        "https://atlascope.org/#/view:share$mode:glass$center:-71.09620,42.34172$zoom:15.58$base:massgis-2021-orthos$overlay:ark:/76611/al8c3u1jq",
    },
  ];

  function handleSelection(shareURL) {
    poppedFlag = false;
    dispatch("selectionMade", { shareURL: shareURL });
  }
</script>

<div>
  <div class="mt-1 relative">
    <button
      type="button"
      on:click={() => {
        poppedFlag = !poppedFlag;
      }}
      class="relative bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-labelledby="listbox-label"
    >
      <span class="flex items-center">
        <span class="ml-1 block truncate text-gray-900 text-lg"
          >Jump to location</span
        >
      </span>
      <span
        class="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
      >
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    <ul
      class:hidden={!poppedFlag}
      class="absolute bottom-12 z-10 mt-1 bg-white shadow-lg max-h-64 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
      tabindex="-1"
      role="listbox"
      aria-labelledby="listbox-label"
      aria-activedescendant="listbox-option-3"
    >
      {#each choices as choice}
        <li
          class="text-gray-800 cursor-pointer select-none relative py-2 px-3 hover:text-red-900"
          role="option"
          on:click={() => {
            handleSelection(choice.shareURL);
          }}
        >
          <div class="flex items-center">
            <span class="text-lg mx-1 inline whitespace-nowrap"
              >{choice.name}</span
            >
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
</style>
