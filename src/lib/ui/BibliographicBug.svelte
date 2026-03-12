<script>
    import { mapState, allLayers } from "../state.svelte.js"; 
    import instanceVariables from "../../config/instance.json";


    const getLayerDataById = (id) => {
        return allLayers.layers.find((l) => l.properties.identifier === id) ? allLayers.layers.find((l) => l.properties.identifier === id) : allLayers.layers.find((l) => l.properties.identifier === id);
    }

    let baseLayer = $derived(getLayerDataById(mapState.layers.base.id));
    let overlayLayer = $derived(getLayerDataById(mapState.layers.overlay.id));

</script>

<div class="bibliographic-bug">
<div class="inline-flex rounded-lg overflow-hidden text-md border-2 border-gray-200">
  <div class="px-2 py-1 border-r-2 border-gray-200"><span class="font-light">Base</span> <span class="font-bold">{baseLayer.properties.year}</span></div>
  <div class="px-2 py-1"><span class="font-light">Overlay</span> <span class="font-bold">{overlayLayer.properties.year}</span></div>
</div>
</div>