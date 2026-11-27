<script>
  import Fa from "svelte-fa";
  import { faArrowsRotate, faList } from "@fortawesome/free-solid-svg-icons";

  import { mapState } from "../state.svelte.js";

  let { onselect, disabled = false } = $props();

  const API = "https://annotations.allmaps.org/maps";
  const LIMIT = 10;
  const MAX_AREA = 5000000;

  let open = $state(false);
  let loading = $state(false);
  let error = $state("");
  let suggestions = $state([]);

  function firstLabel(resource) {
    const values = Object.values(resource?.label ?? {})[0];
    return Array.isArray(values) ? values[0] : null;
  }

  // partOf nests Canvas → Manifest; collect labels outermost first so the
  // manifest title leads and the canvas/page label follows.
  function partOfLabels(source) {
    const labels = [];
    let parts = source?.partOf;
    while (Array.isArray(parts) && parts.length) {
      const label = firstLabel(parts[0]);
      if (label) labels.unshift(label);
      parts = parts[0].partOf;
    }
    return labels;
  }

  function toSuggestion(annotation) {
    const source = annotation.target?.source;
    const [title, ...rest] = partOfLabels(source);
    const provider = (source?.provider ?? []).map(firstLabel).filter(Boolean).join(", ");
    return {
      url: annotation.id,
      title: title ?? "Untitled map",
      detail: rest.join(" · "),
      provider,
    };
  }

  function toggle() {
    if (open) {
      open = false;
      return;
    }
    load();
  }

  async function load() {
    error = "";
    suggestions = [];

    const center = mapState.center;
    if (!center) {
      error = "The map location isn't available yet.";
      open = true;
      return;
    }

    const [lon, lat] = center;
    const params = new URLSearchParams({
      limit: String(LIMIT),
      intersects: `${lat},${lon}`,
      maxarea: String(MAX_AREA),
    });

    loading = true;
    try {
      const res = await fetch(`${API}?${params}`);
      if (!res.ok) throw new Error(`Allmaps responded ${res.status}`);
      const json = await res.json();
      suggestions = (json.items ?? []).filter((a) => a?.id).slice(0, LIMIT).map(toSuggestion);
      if (!suggestions.length) error = "No Allmaps maps found at this location.";
    } catch (e) {
      console.error(e);
      error = "Couldn't load suggestions from Allmaps.";
    } finally {
      loading = false;
      open = true;
    }
  }

  function choose(s) {
    open = false;
    onselect(s.url);
  }
</script>

<div class="mb-4 w-full rounded border border-gray-300 bg-white {open ? 'shadow-lg' : ''}">
  <button
    class="flex w-full items-center px-3 py-2 text-sm text-gray-800 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed {open ? 'rounded-t border-b border-gray-300' : 'rounded'}"
    onclick={toggle}
    disabled={disabled || loading}
    aria-expanded={open}
  >
    <Fa icon={open ? faList : faArrowsRotate} spin={loading} class="mr-2" />
    <span>
      {#if loading}
        Loading ...
      {:else if open}
        Suggestions from Allmaps
      {:else}
        Load suggestions from Allmaps
      {/if}
    </span>
  </button>

  {#if open}
    <div class="max-h-72 overflow-y-auto">
      {#if error}
        <p class="px-3 py-2 text-sm text-red-600">{error}</p>
      {:else}
        <ul>
          {#each suggestions as s (s.url)}
            <li>
              <button
                class="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                onclick={() => choose(s)}
              >
                <span class="block text-sm text-gray-900">{s.title}</span>
                {#if s.detail || s.provider}
                  <span class="block text-xs text-gray-500">
                    {[s.detail, s.provider].filter(Boolean).join(" — ")}
                  </span>
                {/if}
                <span class="block font-mono text-xs text-gray-400 break-all">{s.url}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>
