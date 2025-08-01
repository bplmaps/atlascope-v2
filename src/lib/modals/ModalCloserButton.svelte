<script>
    import Fa from "svelte-fa";
    import {faX} from "@fortawesome/free-solid-svg-icons";

</script>

<button on:click class="absolute bg-yellow-50 rounded-full right-4 top-4 p-3 ring-2 ring-black ring-offset-2 h-3 w-3 drop-shadow cursor-pointer hover:ring-4 hover:ring-red-900 hover:bg-gray-100 transition-all">
        <Fa icon={faX} class="relative -left-1.5 -top-2" />
</button>

<style>

</style>

