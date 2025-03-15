<script>
  import instanceVariables from "../config/instance.json";

  let searchTerm = $state("");
  let selectedItem = $state(null);
  let isOpen = $state(false);
  let { onSelect } = $props();
  let highlightedIndex = $state(-1);

  let items = $state([]);
  let filteredItems = $derived(
    items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  async function fetchCoverage() {
    let r = await fetch(instanceVariables.coverageDescriptiveList);
    let d = await r.json();
    if (r.ok) {
      items = d;
    }
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (highlightedIndex < filteredItems.length - 1) {
          highlightedIndex++;
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (highlightedIndex > 0) {
          highlightedIndex--;
        }
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0) {
          selectItem(filteredItems[highlightedIndex]);
        }
        break;
      case "Escape":
        isOpen = false;
        break;
    }
  }

  function selectItem(item) {
    selectedItem = item;
    searchTerm = item.name;
    isOpen = false;
    highlightedIndex = -1;
    if (onSelect) onSelect(item);
  }

  function handleInput(event) {
    searchTerm = event.target.value;
    isOpen = true;
    highlightedIndex = -1;
  }

  function handleFocus() {
    isOpen = true;
  }

  function handleBlur() {
    // Small delay to allow click events to fire
    setTimeout(() => {
      isOpen = false;
      highlightedIndex = -1;
    }, 200);
  }
</script>

<div class="relative w-full">
  {#await fetchCoverage() then}
    <input
      type="text"
      value={searchTerm}
      oninput={handleInput}
      onfocus={handleFocus}
      onblur={handleBlur}
      onkeydown={handleKeyDown}
      class="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Coverage includes…"
    />

    {#if isOpen && filteredItems.length > 0}
      <ul
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        {#each filteredItems.sort( (a, b) => (a.new ? -1 : b.new ? 1 : 0), ) as item, i}
          <li
            class="px-4 py-2 text-left hover:bg-gray-200 cursor-pointer {i ===
            highlightedIndex
              ? 'bg-blue-100'
              : ''} {item.neighborhood ? 'text-xs' : ''} {filteredItems.filter(
              (item) => item.new,
            ).length > 0 &&
            i + 1 == filteredItems.filter((item) => item.new).length
              ? 'border-b border-gray-300 border-dotted'
              : ''}"
            onclick={() => selectItem(item)}
          >
            {#if item.new}
              <span
                class="bg-stone-100 text-orange-700 rounded-lg p-1 mr-1 text-xs"
                >✨ New</span
              >
            {/if}
            {#if item.neighborhood}
              <span class="text-gray-500">⋯ </span>
            {/if}
            {item.name}
          </li>
        {/each}
      </ul>
    {/if}
  {/await}
</div>
