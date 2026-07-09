<script>
    import Splash from "./Splash.svelte";
    import SearchModalMaptiler from "./SearchModalMaptiler.svelte";
    import BibliographicInfoModal from "./BibliographicInfoModal.svelte";
    import AllmapsUrlModal from "./AllmapsUrlModal.svelte";

    import ModalCloserButton from "./ModalCloserButton.svelte";

    import { toursEnabled } from "../../config/features.js";
    import { appState } from "../state.svelte.js";

    // The tour list is optional per instance; fetch it the first time the
    // modal is opened rather than bundling it
    let TourListModal = $state(null);
    $effect(() => {
        if (appState.modals.tourList && toursEnabled && !TourListModal) {
            import("../tours/TourListModal.svelte").then((m) => {
                TourListModal = m.default;
            });
        }
    });

    function closeAllModals() {
        Object.keys(appState.modals).forEach((key) => {
            appState.modals[key] = false;
        });
        appState.tour.active = false;
    }
</script>

<div class="w-full h-full fixed top-0 left-0 z-50 bg-black/20">
    {#if appState.modals.splash}
        <Splash />
    {:else if appState.modals.search}
        <SearchModalMaptiler />
    {:else if appState.modals.biblio}
        <BibliographicInfoModal />
    {:else if appState.modals.tourList && TourListModal}
        <TourListModal />
    {:else if appState.modals.allmaps}
        <AllmapsUrlModal />
    {/if}
    <ModalCloserButton onclick={closeAllModals} />
</div>
