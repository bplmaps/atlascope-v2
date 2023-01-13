<script>
    import qrcode from 'qrcode';
    import { onMount } from 'svelte';

    export let url;
    let qrCanvas;

    let q = null;

    onMount(() => {q = qrcode.toCanvas(qrCanvas, url)})
    
    $: q ? qrcode.toCanvas(qrCanvas, url) : null;

</script>


    <canvas bind:this={qrCanvas} />

