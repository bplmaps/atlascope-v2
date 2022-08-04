<script>
    import Fa from "svelte-fa";

    export let label;
    export let icon;
</script>

<div class="mt-1 mr-2 relative">
    <button
        on:click
        type="button"
        class="relative bg-white border border-gray-300 rounded-md shadow-sm px-2 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
        <span class="flex items-center">
            <span class="ml-1 block text-gray-900 text-lg"
                ><Fa {icon} class="inline mr-2" />{label}</span
            >
        </span>
    </button>
</div>

<style>
</style>
