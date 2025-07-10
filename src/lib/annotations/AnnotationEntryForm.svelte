<script>
    import { createEventDispatcher } from "svelte";
    import { writeAnnotation } from "../helpers/supabaseFunctions";

    export let pos = [0, 0];
    export let featureExtent = [0, 0, 0, 0];
    export let layerID;
    export let layerName;
    const buffer = -15;

    let topPos = window.innerWidth > 768 ? Math.min((window.innerHeight - 300), (pos[1] + buffer)) + "px" : "50vh";
    let leftPos = window.innerWidth > 768 ? Math.min((0.68 * window.innerWidth), (pos[0] + buffer)) + "px" : "10vw";

    let annotationBodyEntry;
    let annotationEmailEntry;
    let newId;

    let processing = false;
    let completed = false;

    let dispatch = createEventDispatcher();

    function cancelAnnotationEntry() {
        dispatch("cancel");
    }

    function processAnnotationSubmission() {
        processing = true;
        if (!annotationBodyEntry || annotationBodyEntry === "") {
            window.alert(
                "You must enter some text in the annotation to save it."
            );
            processing = false;
        } else {
            writeAnnotation(
                featureExtent,
                annotationBodyEntry,
                annotationEmailEntry,
                layerID
            ).then(() => {
                processing = false;
                completed = true;
                setTimeout(() => {
                    dispatch("cancel");
                }, 5000);
            });
        }
    }
</script>

<div
    id="annotation-entry-holder"
    class="fixed z-50 p-0 w-[80vw] md:w-[30vw]"
    style="top: {topPos}; left: {leftPos}"
>
    <div
        class="mb-4 w-full bg-gray-50 rounded-lg border border-gray-200"
    >
    <div class="text-sm text-gray-800 px-4 py-2 border-b">
        Annotations are saved to the overlay layer, <strong>{layerName}</strong>.
    </div>
        {#if !completed}
            <form>
                <div class="py-1 px-2 bg-white rounded-t-lg">
                    <label for="comment" class="sr-only"
                        >Annotation text entry</label
                    >
                    <textarea
                        id="comment"
                        rows="4"
                        class="p-3 w-full text-sm text-gray-900 bg-white border-0 focus:ring-0"
                        placeholder="Add an annotation by describing what is here, writing a story about this place, or posing a question"
                        name="annotation-input-body"
                        required
                        bind:value={annotationBodyEntry}
                    />
                </div>
                <div class="py-2 px-3">
                    <input
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 text-xs focus:outline-none focus:shadow-outline"
                        type="text"
                        name="annotation-input-email"
                        placeholder="Your email (optional, not public)"
                        bind:value={annotationEmailEntry}
                    />
                </div>
                <div
                    class="flex items-center py-2 px-3 border-t"
                >
                    <button
                        on:click|preventDefault={processAnnotationSubmission}
                        disabled={processing}
                        type="submit"
                        class="inline-flex items-center py-2 px-3 mr-2 text-sm border border-blue-900 text-blue-900 hover:bg-blue-50 font-medium text-center rounded-lg focus:ring-4 focus:ring-blue-200"
                    >
                        {#if processing}Saving ...{:else}Save annotation{/if}
                    </button>
                    {#if !processing}
                        <button
                            on:click={cancelAnnotationEntry}
                            class="inline-flex items-center py-2 px-3 mr-2 text-sm border border-red-900 text-red-900 hover:bg-red-50 font-medium text-center rounded-lg focus:ring-4 focus:ring-blue-200"
                        >
                            Cancel
                        </button>
                    {/if}
                </div>
            </form>
        {:else}
            <h2 class="text-sm font-semibold text-gray-800 mx-3 my-4">Thanks! Your annotation has been saved.</h2>
        {/if}
    </div>
</div>

<style>

</style>
