<script>
  // TEMPORARY campaign UI. A floating badge that expands into a short pitch and
  // a call to action: it uploads the current map view, then opens the Fundraise
  // Up checkout with the stored image's key prefilled as a custom field, so the
  // gift is tied to the place the donor was looking at.
  //
  // To remove when the drive ends: delete this directory, the import/visible/
  // render block in Map.svelte, and the Fundraise Up loader in index.html. The
  // storeMapImage/saveMapImage split in map/ is a general improvement and stays.
  import Fa from "svelte-fa";
  import { faImage } from "@fortawesome/free-solid-svg-icons";

  import LoadingSpinner from "../ui/LoadingSpinner.svelte";
  import { saveMapImage } from "../map/mapActions.js";
  import { shareViewURL } from "../helpers/shareURLs.js";
  import { mapState } from "../state.svelte.js";

  // The Fundraise Up campaign this badge donates to, and the name of the custom
  // field it fills in. The field has to exist on the campaign in the Fundraise
  // Up dashboard or the value is silently dropped.
  const CAMPAIGN = "FUNRPRNESZF";
  const IMAGE_FIELD = "image-id";
  const LINK_FIELD = "image-link";

  let expanded = $state(false);
  let saving = $state(false);
  let errorMessage = $state(null);

  // The gradient header is both the collapsed badge and the disclosure trigger,
  // so focus has somewhere to return to when "hide this" unmounts itself.
  let toggleEl;

  function collapse() {
    expanded = false;
    errorMessage = null;
    toggleEl?.focus();
  }

  function toggle() {
    if (expanded) collapse();
    else expanded = true;
  }

  async function saveAndDonate() {
    if (saving) return;
    saving = true;
    errorMessage = null;

    // No synchronous window.open here, unlike ExportShareButton: openCheckout
    // renders an in-page overlay, so there's no popup to be blocked and nothing
    // that has to happen inside the click's user-gesture context. Don't add one.
    try {
      // Captured before the upload so the link describes the view that was
      // actually saved, not wherever the map drifted to while it ran.
      const viewURL = shareViewURL();
      const hash = await saveMapImage();
      // Installed by the loader in index.html, so it isn't in the DOM types;
      // cast here rather than declaring a global for one call site.
      const fundraiseUp = /** @type {any} */ (window).FundraiseUp;
      fundraiseUp.openCheckout(CAMPAIGN, {
        customFields: { [IMAGE_FIELD]: hash, [LINK_FIELD]: viewURL },
      });
    } catch (error) {
      // Shown in the panel rather than ExportShareButton's window.alert: the
      // panel is already open and has room, and an alert stacked on top of a
      // donation ask is a good way to lose the donation.
      console.error("Fundraiser image save failed:", error);
      errorMessage = `We're sorry — ${error.message}`;
      expanded = true;
    } finally {
      saving = false;
    }
  }
</script>

<svelte:window
  onkeydown={(event) => {
    if (event.key === "Escape" && expanded) collapse();
  }}
/>

<!-- z-30: above the on-map panels (DataLayerBadge is z-20), below the modal
     layer (ModalWrapper and AnnotationEntryForm are z-50). -->
<div
  class="absolute top-5 right-5 z-30 overflow-hidden shadow-lg {expanded
    ? 'flex flex-col rounded-xl bg-white w-[85vw] max-w-xs max-h-[45vh] md:w-[40vw] md:min-w-64 md:max-w-md md:max-h-[max(20vh,16rem)]'
    : 'rounded-full'}"
>
  <div
    bind:this={toggleEl}
    type="button"
    onclick={toggle}
    aria-expanded={expanded}
    aria-controls="fundraiser-body"
    class="flex w-full shrink-0 cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm font-bold text-white bg-linear-to-br from-pink-600 to-red-700 hover:from-pink-500 hover:to-red-600 focus:ring-2 focus:ring-inset focus:ring-white focus:outline-none"
  >
    <span aria-hidden="true"><Fa icon={faImage} /></span>
    <span>Share Your Where</span>
</div>

  {#if expanded}
    <div id="fundraiser-body" class="min-h-0 grow overflow-y-auto px-4 py-3">
      <p class="text-xs leading-snug text-gray-700">
Support the Leventhal Center’s teaching programs with a donation and see your favorite Atlascope view on the wall of our Learning Center, just in time for the opening of our Where Workshop.
Navigate to a place that’s meaningful to you in Atlascope. Then, click below and we’ll honor your gift by displaying this view and your own caption in our space for the first three weeks of the new exhibition.      </p>
      {#if errorMessage}
        <p role="alert" class="mt-2 text-xs font-semibold text-red-700">
          {errorMessage}
        </p>
      {/if}
    </div>

    <div
      class="flex shrink-0 flex-row gap-1 border-t border-gray-200 px-4 py-2"
    >
      <!-- `type` is omitted on both buttons below on purpose: global.css's
           unlayered [type='button'] { @apply bg-white } outranks every Tailwind
           background utility, and would flatten these two to white. There's no
           form in the app, so a default-type button is inert. -->
      <button
        onclick={saveAndDonate}
        disabled={saving || !mapState.mounted}
        class="cursor-pointer rounded bg-pink-700 px-3 py-2 text-xs font-bold text-white hover:bg-pink-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
      >
        {#if saving}
          <span class="inline-flex items-center gap-2">
            <LoadingSpinner class="w-3 h-3" /> Saving your view…
          </span>
        {:else}
          Save this view and donate
        {/if}
      </button>
      <button
      onclick={collapse}
      class="text-xs text-white bg-gray-500 cursor-pointer rounded py-2 px-3">No thanks</button>

      <!-- A disabled button's label change isn't announced; this is what tells a
           screen reader the upload is running. -->
      <p class="sr-only" aria-live="polite">
        {saving ? "Saving your map view. This can take a few seconds." : ""}
      </p>

    </div>
  {/if}
</div>

<style>
</style>
