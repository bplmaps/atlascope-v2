<script>
  import Fa from "svelte-fa";
  import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";

  import { onMount } from "svelte";
  import { appState } from "../state.svelte.js";
  import { applyMapState } from "../map/mapActions.js";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";

  let nav;
  let status = $state("loading");
  let statusText = $state("Finding your location ...");
  let dismissTimeout;

  function dismissAfterDelay() {
    dismissTimeout = setTimeout(() => {
      appState.modals.geolocation = false;
    }, 5000);
  }

  function handleGeolocationSuccess(pos) {
    status = "found";
    statusText = "Location found";
    applyMapState({
      center: [pos.coords.longitude, pos.coords.latitude],
      zoom: 17,
      dropPin: true
    });
    dismissAfterDelay();
  }

  function handleGeolocationError() {
    status = "failed";
    statusText = "Location unavailable";
    dismissAfterDelay();
  }

  onMount(() => {
    if (navigator.geolocation) {
      nav = navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        {
          timeout: 10000,
        }
      );
    } else {
      handleGeolocationError();
    }

    return () => clearTimeout(dismissTimeout);
  });
</script>

<div>
  {#if status === "loading"}
    <LoadingSpinner class="w-4 h-4 dark:text-gray-600 inline" />
  {/if}

  <Fa icon={faLocationArrow} class="inline mr-2" /><span class="font-bold">
    {statusText}</span
  >

  {#if status === "failed"}
  <p class="text-sm">Unable to find your location. Your browser may not have permission to find your location, or your device may not have been able to determine your location.</p>
  {/if}
</div>

<style>
</style>
