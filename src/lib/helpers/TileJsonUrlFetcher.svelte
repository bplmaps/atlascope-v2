<script>
    let { tileJsonUrl } = $props();
    
    async function fetchTileData() {
        if (!tileJsonUrl) return null;
        
        try {
            const response = await fetch(tileJsonUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonData = await response.json();
            return jsonData.tiles?.[0] || null;
        } catch (err) {
            throw new Error(err.message);
        }
    }
</script>

<div>
    {#await fetchTileData()}
        <p>Loading tile data...</p>
    {:then tileData}
        {#if tileData}
        <div class="flex"><span class="font-semibold pr-3">Tile URL </span><span class="font-mono text-gray-700">{tileData}</span></div>
        {:else}
            <p>No tile data available</p>
        {/if}
    {:catch error}
        <p class="error">Error: {error.message}</p>
    {/await}
</div>

<style>
    
</style>