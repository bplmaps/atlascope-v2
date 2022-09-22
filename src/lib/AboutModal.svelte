<script>
  import Fa from "svelte-fa";
  import {
    faBookBookmark, faQuestionCircle,
  } from "@fortawesome/free-solid-svg-icons";
  
  import { createEventDispatcher } from "svelte";
  import SvelteMarkdown from "svelte-markdown";
  import instanceVariables from "../config/instance.json";
  let dispatch = createEventDispatcher();

  import ModalCloserButton from "./ModalCloserButton.svelte";


</script>

<section id="about-credits-info-modal">
  <div class="modal-outer">
    <div class="modal-inner relative w-full">
      <h1 class="text-xl font-bold">
        <Fa icon={faQuestionCircle} class="inline mr-2" />About Atlascope
      </h1>

      <SvelteMarkdown source={instanceVariables.aboutPage} />



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
