<script>
    import Splash from "./Splash.svelte";

    import { appState } from "../state.svelte.js";
</script>

<div class="w-full h-full bg-black/50">
    {#if appState.modals.splash}
        <Splash />
    {/if}
</div>
