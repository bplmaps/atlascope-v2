<script>
    import Fa from "svelte-fa";

    export let label;
    export let icon;
    export let disabled = false;
    export let size = "lg";

    let iconMargin = label === "" ? "mr-0" : "mr-2"
</script>

<div class="mt-1 mr-2 relative">
    <button
        on:click
        type="button"
        disabled="{disabled}"
        class="relative text-{size} bg-white border border-gray-300 rounded-md bg-white shadow-sm px-2 py-2 text-left cursor-pointer focus:outline-none hover:bg-sky-50 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
    >
        <span class="flex flex-nowrap items-center cursor-pointer">
            <span class="mx-1 block {disabled ? "text-gray-100" : "text-gray-900" }"
                ><Fa {icon} class="inline {iconMargin}" />{label}</span
            >
        </span>
    </button>
</div>

<style>
</style>
