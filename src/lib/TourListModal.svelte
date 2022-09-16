<script>
  import Fa from "svelte-fa";

  import { createEventDispatcher } from "svelte";

  import ModalCloserButton from "./ModalCloserButton.svelte";
    import { faHiking } from "@fortawesome/free-solid-svg-icons";

  let dispatch = createEventDispatcher();
 
</script>

<section id="search-modal">
  <div class="modal-outer">
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold">
        <Fa icon={faHiking} class="inline mr-2" />Take a tour
      </h1>
      
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
