<script>
    import Fa from "svelte-fa";

    const {
        label,
        icon,
        disabled = false,
        size = "lg",
        collapsibleLabel = false,
        hideableOnMobile = false,
    } = $props();

    let iconMargin = label === "" ? "mr-0" : "mr-2"
</script>

<div class={`${hideableOnMobile ? "hidden md:block" : ""} mt-1 mr-2 relative`}>
    <button
        on:click
        type="button"
        disabled="{disabled}"
        class="relative text-{size} bg-white border border-gray-300 rounded-md bg-white shadow-sm px-2 py-2 text-left cursor-pointer focus:outline-none hover:bg-sky-50 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
    >
        <div class="flex flex-nowrap items-center cursor-pointer">
            <Fa {icon} class="inline {iconMargin} ml-1" />
            <span class="mx-1 block {disabled ? "text-gray-100" : "text-gray-900" } {collapsibleLabel ? "hidden md:block" : ""}"
                >{label}</span
            >
        </div>
    </button>
</div>

<style>
</style>
