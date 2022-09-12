<script>
    import { createEventDispatcher } from "svelte";
    import { writeAnnotation } from "./helpers/writeAnnotation";

    export let pos = [0, 0];
    export let featureExtent = [0, 0, 0, 0];
    export let layerID;
    const buffer = -15;

    let annotationBodyEntry;
    let annotationEmailEntry;

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
    class="p-0"
    style="top: {pos[1] + buffer}px; left: {pos[0] + buffer}px;"
>
    <div
        class="mb-4 w-full bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
    >
        {#if !completed}
            <form>
                <div class="py-2 px-4 bg-white rounded-t-lg dark:bg-gray-800">
                    <label for="comment" class="sr-only"
                        >Annotation text entry</label
                    >
                    <textarea
                        id="comment"
                        rows="4"
                        class="p-3 w-full text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
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
                        placeholder="Your email (optional)"
                        bind:value={annotationEmailEntry}
                    />
                </div>
                <div
                    class="flex items-center py-2 px-3 border-t dark:border-gray-600"
                >
                    <button
                        on:click|preventDefault={processAnnotationSubmission}
                        disabled={processing}
                        type="submit"
                        class="inline-flex items-center py-2.5 px-4 mr-2 text-xs font-medium text-center rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
                    >
                        {#if processing}Saving ...{:else}Save annotation{/if}
                    </button>
                    {#if !processing}
                        <button
                            on:click={cancelAnnotationEntry}
                            class="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center rounded-lg text-red-900 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
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
    #annotation-entry-holder {
        width: 25vw;
        position: absolute;
        z-index: 99;
    }
</style>
