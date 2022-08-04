<script>
    import Fa from "svelte-fa";
    import {faX} from "@fortawesome/free-solid-svg-icons";
</script>

<div on:click class="absolute bg-yellow-50 rounded-full -right-2 -top-2 p-3 ring-2 ring-black ring-offset-2 h-3 w-3 drop-shadow cursor-pointer hover:ring-4 hover:ring-red-900 hover:background-yellow-100 transition-all">
        <Fa icon={faX} class="relative -left-1.5 -top-2" />
</div>

<style>

</style>

