<script>
  import Fa from "svelte-fa";
  import {
faBookBookmark,
  } from "@fortawesome/free-solid-svg-icons";
  
  import { createEventDispatcher } from "svelte";

  let dispatch = createEventDispatcher();

  import ModalCloserButton from "./ModalCloserButton.svelte";

</script>

<section id="bibliographic-info-modal">
  <div class="modal-outer">
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold">
        <Fa icon={faBookBookmark} class="inline mr-2" />Bibliographic information
      </h1>

      <h2>Base Layer</h2>

      <p>Info here...</p>

      <h2>Overlay Layer</h2>

      <p>Info here...</p>



      <ModalCloserButton
        on:click={() => {
          dispatch("closeSelf");
        }}
      />
    </div>
  </div>
</section>

<style>
  section {
    background-color: rgba(16, 16, 16, 0.853);
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
  }

  .modal-outer {
    padding: 30px;
  }

  .modal-inner {
    background-color: white;
    border-radius: 5px;
    padding: 20px;
    min-height: 200px;
  }
</style>
