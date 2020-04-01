<script>
  import { fade, fly } from "svelte/transition";

  export let onCloseModal;
  export let onSubmit;
  export let showModal; // bind-val

  function toggleModal() {
    showModal = !showModal;
  }

  function handleClose() {
    toggleModal();
    onCloseModal();
  }

  function handleSubmit() {
    toggleModal();
    onSubmit();
  }
</script>

{#if showModal}
  <!-- The Modal -->
  <div
    class="modal"
    style="display: block;"
    transition:fly={{ y: 200, duration: 500 }}>
    <div class="modal-dialog">
      <div class="modal-content">

        <!-- Modal Header -->
        <div class="modal-header">
          <h4 class="modal-title">
            <slot name="title">Unknown name</slot>
          </h4>
          <button type="button" class="close" on:click={handleClose}>
            &times;
          </button>
        </div>

        <!-- Modal body -->
        <div class="modal-body">
          <slot name="body" />
        </div>

        <!-- Modal footer -->
        <div class="modal-footer">
          <button class="btn btn-primary" on:click={handleSubmit}>
            Get Quote
          </button>
          <button type="button" class="btn btn-danger" on:click={handleClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  </div>

  <div class="modal-backdrop show" transition:fade />
{/if}
