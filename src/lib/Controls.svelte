<script>
    import Fa from 'svelte-fa';
    import { faDraftingCompass, faLayerGroup, faAngleUp, faExclamationCircle, faArrowsAltV, faArrowsAltH, faBorderStyle, faCircle } from '@fortawesome/free-solid-svg-icons';
  
    export let validLayers;
  
    let panelShown = "none";
    let menuActive = {
        "layers": false,
        "overlay": false
    }
  
    let menuToggler = (m) => {
        for (const [k,v] of Object.entries(menuActive)){
          menuActive[k] = m===k ? !(menuActive[k]) : false;
        }
        console.log(menuActive);
    }
  
    let showHideControls = (event) => {
        panelShown = (panelShown === event.target.dataset.controlTabValue) ? "none" : event.target.dataset.controlTabValue;
    }
  
  </script>
  
  <style>
  
      
      .controls-outer-wrapper {
          position: absolute;
          bottom: 0;
          left: 20px;
          right: 50px;
      }
  
      .control-tab {
          display: inline-block;
          background-color: rgba(255,255,255,0.97);
          padding: 10px 20px;
          font-weight: 650;
          cursor: pointer;
          border-radius: 5px 5px 0 0;
          transition: color 0.5s, background-color 0.5s;
          
      }

      .control-tab:hover {
              background-color: rgb(241, 242, 247);
      }
  
      .control-panel-wrapper {
          background-color: rgb(255,255,255);
          border-radius: 0 5px 0 0;
      }
  
      .control-panel {
          padding: 30px;
      }
  
  </style>
  
  
  <div class="controls-outer-wrapper">
      <div class="control-tab-wrapper">
          <div class="control-tab" id="control-tab-map-controls" data-control-tab-value="map-controls" on:click={showHideControls}><Fa icon={faDraftingCompass} class="mr-2" />Controls</div>
          <div class="control-tab" data-control-tab-value="layer-controls" on:click={showHideControls}><Fa icon={faLayerGroup} class="mr-2" />Atlases</div>
      </div>
  
      {#if panelShown != "none" }
      <div class="control-panel-wrapper">
          {#if panelShown === "map-controls" }
          <div class="control-panel">
              
              <div class="{menuActive.overlay ? "is-active" : ""} dropdown is-up" id="overlay-dropdown">
                  <div class="dropdown-trigger">
                    <button class="button" aria-haspopup="true" aria-controls="overlaymode-menu" on:click="{()=>{menuToggler('overlay')}}">
                      <span><span class="overlay-fixed-label has-text-weight-light">Overlay</span> <span class="has-text-weight-semibold" id="current-overlay-mode-label">Glass</span></span>
                      <span class="icon is-small">
                        <Fa icon={faAngleUp} />
                      </span>
                    </button>
                  </div>
                  <div class="dropdown-menu" id="overlaymode-menu" role="menu">
                    <div class="dropdown-content">
                      <div class="dropdown-item overlay-option" data-overlaymode="glass">
                          <Fa icon={faCircle} class="mr-2" /> Glass
                      </div>
                      <div class="dropdown-item overlay-option" data-overlaymode="swipe-y">
                          <Fa icon={faArrowsAltV} class="mr-2" /> Swipe Y
                      </div>
                      <div class="dropdown-item overlay-option" data-overlaymode="swipe-x">
                          <Fa icon={faArrowsAltH} class="mr-2" /> Swipe X
                      </div>
                      <div class="dropdown-item overlay-option" data-overlaymode="opacity">
                          <Fa icon={faBorderStyle} class="mr-2" /> Opacity
                      </div>
                    </div>
                  </div>
                </div>
  
  
          </div>
          {:else if panelShown === "layer-controls" }
          <div class="control-panel">
    
              <div class="{menuActive.layers ? "is-active" : ""} dropdown is-up">
                  <div class="dropdown-trigger">
                      <button on:click="{()=>{menuActive.layers = !menuActive.layers}}" class="button" aria-haspopup="true" aria-controls="layer-dropdown"><span>Layers</span> <span class="icon is-small"><Fa icon="{faAngleUp}" /></span></button>
                  </div>
                  <div class="dropdown-menu" id="layer-dropdown" role="menu">
                      <div class="dropdown-content">
                      {#each validLayers as layer}
                          <div class="dropdown-item">{layer.layer.properties.year}{#if layer.vis < 0.8 }<Fa icon={faExclamationCircle} class="ml-2" />{/if}</div>
                      {/each}
                      <hr class="dropdown-divider">
                      <div class="dropdown-item">Modern Streets</div>
                      <div class="dropdown-item">Modern Aerial</div>
                      </div>
                  </div>
              </div>
          </div>
          {/if}
      </div>
      {/if}
  
  </div>