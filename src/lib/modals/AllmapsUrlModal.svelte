<script>

  import { appState } from "../state.svelte.js";
  import { loadAllmapsAnnotation } from "../map/mapActions.js";

  const ERROR_MSG =
    "Something went wrong, and I couldn't load a valid annotation from this URL.";

  // Capture the target slot once so an in-flight fetch can't be retargeted if
  // the user reopens the menu while loading.
  const slot = appState.allmapsTargetSlot;

  let url = $state("");
  let error = $state("");
  let loading = $state(false);

  function isAllmapsAnnotation(j) {
    if (!j || typeof j !== "object") return false;
    if (j.type === "Annotation") return true;
    if (j.type === "AnnotationPage" && Array.isArray(j.items)) return true;
    return false;
  }

  function close() {
    appState.modals.allmaps = false;
    appState.allmapsTargetSlot = null;
  }

  // Cancel aborts the menu selection — nothing has changed yet, so closing
  // the modal is a clean abort.
  function cancel() {
    close();
  }

  async function submit() {
    error = "";

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      error = ERROR_MSG;
      return;
    }

    loading = true;
    try {
      const res = await fetch(parsed.href);
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (!isAllmapsAnnotation(json)) throw new Error();
      await loadAllmapsAnnotation(slot, json, parsed.href);
      close();
    } catch {
      error = ERROR_MSG;
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !loading) {
      submit();
    }
  }
</script>

<section id="allmaps-url-modal">
  <div class="modal-outer">
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold">
        Custom Allmaps layer
      </h1>
      <p class="text-sm font-light">
        Paste a URL to an Allmaps Georeferencing Annotation to load it onto the
        base layer.
      </p>

      <div class="my-4">
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
          id="allmaps-url-input"
          type="text"
          placeholder="Enter URL to Allmaps annotation JSON"
          bind:value={url}
          onkeydown={handleKeydown}
        />
      </div>

      {#if error}
        <p class="text-red-600 text-sm my-3">{error}</p>
      {/if}

      <div class="flex gap-2">
        <button
          class="bg-blue-200 hover:bg-blue-900 text-gray-800 text-sm px-3 py-2 rounded transition-all hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          onclick={submit}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load layer"}
        </button>
        <button
          class="bg-gray-200 hover:bg-gray-400 text-gray-800 text-sm px-3 py-2 rounded transition-all cursor-pointer"
          onclick={cancel}
        >
          Cancel
        </button>
      </div>
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
