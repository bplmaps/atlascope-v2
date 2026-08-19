<script>
  import { faCamera } from "@fortawesome/free-solid-svg-icons";

  import LightIconButton from "../ui/LightIconButton.svelte";
  import { shareMapImage } from "../map/mapActions.js";

  // urlTemplate is the outbound URL, with `{hash}` standing in for the stored
  // image's filename — e.g. "https://example.org/view/{hash}". Drop this
  // button anywhere with a different template to wire up another service.
  const {
    label,
    urlTemplate,
    icon = faCamera,
    busyLabel = "Sharing…",
    collapsibleLabel = false,
    hideableOnMobile = false,
  } = $props();

  let busy = $state(false);

  function share() {
    if (busy) return;
    busy = true;

    // The tab has to be opened synchronously, inside the click: by the time
    // the upload resolves the user-gesture context is gone and popup blockers
    // reject window.open outright.
    const tab = window.open("", "_blank");

    shareMapImage(urlTemplate, {
      onUrl: (url) => {
        if (tab) tab.location = url;
        else window.open(url, "_blank");
      },
    })
      .catch((error) => {
        if (tab) tab.close();
        console.error("Map image share failed:", error);
        window.alert(`We're sorry — ${error.message}`);
      })
      .finally(() => {
        busy = false;
      });
  }
</script>

<LightIconButton
  label={busy ? busyLabel : label}
  {icon}
  {collapsibleLabel}
  {hideableOnMobile}
  disabled={busy}
  onclick={share}
/>
