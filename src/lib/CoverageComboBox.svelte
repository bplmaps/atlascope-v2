<script>
  let searchTerm = $state('');
  let selectedItem = $state(null);
  let isOpen = $state(false);
  let { items = [], onSelect } = $props();
  let highlightedIndex = $state(-1);


  let filteredItems = $derived(
    items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  function handleKeyDown(event) {
    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (highlightedIndex < filteredItems.length - 1) {
          highlightedIndex++;
        }
        break;
      case 'ArrowUp': 
        event.preventDefault();
        if (highlightedIndex > 0) {
          highlightedIndex--;
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0) {
          selectItem(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
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
      {#each filteredItems.sort((a, b) => a.new ? -1 : b.new ? 1 : 0) as item, i}
        {#if item.new }
          <li
            class="px-4 py-2 text-left bg-blue-100 hover:bg-blue-200 cursor-pointer {i === highlightedIndex ? 'bg-blue-100' : ''}"
            onclick={() => selectItem(item)}
          >
            <span class="bg-blue-300 rounded-lg p-1 mr-1" style="font-size:0.7em;font-style:oblique;">New!</span> {item.name}
          </li>
        {:else if item.neighborhood}
          <li
              class="px-4 py-2 text-left hover:bg-gray-200 cursor-pointer {i === highlightedIndex ? 'bg-blue-100' : ''}"
              onclick={() => selectItem(item)}
            >
            <span style="font-size:0.8em;font-style:oblique;">—> {item.name}</span>
          </li>
        {:else}
          <li
            class="px-4 py-2 text-left hover:bg-gray-200 cursor-pointer {i === highlightedIndex ? 'bg-blue-100' : ''}"
            onclick={() => selectItem(item)}
          >
            {item.name}
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>
