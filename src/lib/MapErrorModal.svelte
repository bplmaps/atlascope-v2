<script>
    import Fa from "svelte-fa";
    import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

    import instanceVariables from "../config/instance.json";

    export let outOfBoundsMessage;
    export let movedOffEdgeMessage;
</script>

<div class="w-full mt-4">
    {#if outOfBoundsMessage}
        <div
            class="w-2/3 mx-auto bg-orange-100/90 text-rose-900 py-2 px-5 rounded drop-shadow mb-4 font-semibold text-center"
        >
            <Fa icon={faExclamationCircle} class="inline mr-0.5" /> You're looking
            at a location where no historic atlas layers are currently available.
            <p class="font-light text-sm">
                <a
                    href={instanceVariables.outOfBoundsMessage.url}
                    target="_blank"
                    rel="noreferrer"
                    >{instanceVariables.outOfBoundsMessage.text}</a
                >
            </p>
        </div>
    {/if}

    {#if movedOffEdgeMessage}
        <div
            class="w-2/3 mx-auto bg-orange-100/90 text-rose-900 py-2 px-5 rounded drop-shadow mb-4 font-semibold text-center"
        >
            <Fa icon={faExclamationCircle} class="inline mr-0.5" /> You moved off
            the edge of the previous atlas.
            <p class="font-light text-sm">
                We automatically pulled up a new layer.
            </p>
        </div>
    {/if}
</div>
