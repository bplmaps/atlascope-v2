<script>
    import Splash from "./Splash.svelte";
    import SearchModalMaptiler from "./SearchModalMaptiler.svelte";
    import BibliographicInfoModal from "./BibliographicInfoModal.svelte";
    import TourListModal from "./TourListModal.svelte";

    import ModalCloserButton from "./ModalCloserButton.svelte";

    import { appState } from "../state.svelte.js";

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
    {:else if appState.modals.tourList}
        <TourListModal />
    {/if}
    <ModalCloserButton on:click={closeAllModals} />
</div>
