<script>
  import Fa from "svelte-fa";
  import {
    faCopy
  } from "@fortawesome/free-solid-svg-icons";

  let showView = $state(true);

  import { mapState } from "../state.svelte.js";
  import instanceVariables from "../../config/instance.json";
  import { copyShareLink } from "../helpers/copyUrl";

  let urlField;

  let shareURLs = $derived({
    app: instanceVariables.baseURL,
    view: `${instanceVariables.baseURL}/#/view:share$mode:${mapState.viewMode}$center:${mapState.center.map((c) => c.toFixed(6)).join(",")}$zoom:${mapState.zoom.toFixed(2)}$base:${
      mapState.layers.base.id
    }$overlay:${mapState.layers.overlay.id}`,
  });

  
</script>

<div>
  <h2 class="md:hidden text-xl font-bold mb-2">Share</h2>
  <div class="control-panel">
    <div class="md:flex md:flex-row w-full">
      <div class="pt-2 pb-1 text-center">
        <div class="inline-flex items-center">
          <span
            class="mr-2 text-sm font-medium {!showView
              ? 'text-red-900'
              : 'text-gray-500'} text-center cursor-pointer"
            onclick={() => (showView = false)}>App link</span
          >
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showView}
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
            ></div>
          </label>
          <span
            class="ml-2 text-sm font-medium {showView
              ? 'text-red-900'
              : 'text-gray-500'} text-center cursor-pointer"
            onclick={() => (showView = true)}>View link</span
          >
        </div>
      </div>
      <div class="px-3 flex-grow flex">
        <input
          type="text"
          id="share-app-url"
          class="flex-grow shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={showView ? shareURLs.view : shareURLs.app}
          bind:this={urlField}
          readonly
        />
        <button class="ml-2 flex items-center text-sm" onclick={() => copyShareLink(urlField, showView)}
          ><Fa icon={faCopy} class="inline" /><span
            class="md:inline ml-1 hidden">Copy</span
          ></button
        >
      </div>
    </div>
  </div>
</div>

<style>
</style>
