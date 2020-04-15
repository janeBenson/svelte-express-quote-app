<script>
  import { fade, fly } from 'svelte/transition'

  export let canCloseModal = () => true
  export let showModal

  function toggleModal() {
    showModal = !showModal
  }

  function handleClose() {
    if (canCloseModal()) {
      toggleModal()
    }
    return
  }
  $: {
    if (showModal) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }
</script>

<style>
  .modal-dialog,
  .modal-content {
    /* 80% of window height */
    height: 80%;
  }
  .modal-body {
    /* 100% = dialog height, 120px = header + footer */
    max-height: calc(100% - 120px);
    overflow-y: auto;
  }
  :global(.no-scroll) {
    overflow: hidden;
  }
</style>

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
            <slot name="title">Name not provided</slot>
          </h4>
          <button type="button" class="close" on:click={handleClose}>
            &times;
          </button>
        </div>

        <!-- Modal body -->
        <div class="modal-body">
          <slot name="body">Modal Body</slot>
        </div>

        <!-- Modal footer -->
        <!-- <div class="modal-footer">
          <slot name="footer" />
        </div> -->
      </div>

    </div>
  </div>

  <div class="modal-backdrop show" transition:fade />
{/if}
