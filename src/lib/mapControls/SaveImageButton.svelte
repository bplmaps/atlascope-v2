<script>
  import Fa from "svelte-fa";
  import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons";

  import LoadingSpinner from "../ui/LoadingSpinner.svelte";
  import { downloadMapImage } from "../map/mapActions.js";

  let highRes = $state(false);
  let busy = $state(false);

  function save() {
    if (busy) return;
    busy = true;

    downloadMapImage({ scale: highRes ? 2 : 1, credit: true })
      .catch((error) => {
        console.error("Map image save failed:", error);
        window.alert(`We're sorry — ${error.message}`);
      })
      .finally(() => {
        busy = false;
      });
  }
</script>

<!-- One bordered control holding two siblings: a checkbox can't sit inside a
     <button>. The button omits type="button" so global.css's unlayered
     [type='button'] background rule doesn't defeat its hover color. -->
<div class="mt-1 mr-2 relative">
  <div
    class="flex items-center text-lg bg-white border border-gray-300 rounded-md shadow-sm"
  >
    <button
      onclick={save}
      disabled={busy}
      class="flex items-center px-2 py-2 rounded-l-md cursor-pointer focus:outline-none hover:bg-sky-50 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
    >
      {#if busy}
        <LoadingSpinner class="inline w-[1em] h-[1em] mr-2 ml-1" />
      {:else}
        <Fa icon={faFileArrowDown} class="inline mr-2 ml-1" />
      {/if}
      <span class="mx-1 {busy ? 'text-gray-400' : 'text-gray-900'}"
        >{busy ? "Saving…" : "Save image"}</span
      >
    </button>
    <label
      class="flex items-center gap-1 pl-1 pr-3 text-xs text-gray-500 cursor-pointer select-none"
    >
      <input
        type="checkbox"
        bind:checked={highRes}
        disabled={busy}
        class="sr-only peer"
      />
      <span
        class="relative w-7 h-4 bg-gray-200 rounded-full peer-checked:bg-blue-700 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:size-3 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-3"
      ></span>
      high-res
    </label>
  </div>
</div>
