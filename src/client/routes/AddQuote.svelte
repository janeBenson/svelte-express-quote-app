<script>
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  import getRandomQuote from "../services/getRandomQuote.js";

  let authorClass = "";
  let input;
  let showRating = false;
  let showModal = false;
  let errors = null;
  let quoteContentsClass = "";
  let fetchedQuote;

  resetInput();

  $: {
    showRating ? (input.rating = 0) : (input.rating = null);
    authorClass =
      errors !== null ? (errors.name ? "is-invalid" : "is-valid") : "";
    quoteContentsClass =
      errors !== null ? (errors.quoteContents ? "is-invalid" : "is-valid") : "";
  }

  async function handleSubmit(event) {
    if (!validateInput()) {
      return;
    }

    await fetch("http://localhost:3000/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });

    resetForm();
  }

  async function handleClick() {
    fetchedQuote = await getRandomQuote();
    input.en = fetchedQuote.en;
    input.author.name = fetchedQuote.author.name;
  }

  function resetInput() {
    input = {
      en: "",
      author: { name: "" }
    };
  }

  function resetForm() {
    resetInput();
    showRating = false;
    errors = null;
  }

  function validateInput() {
    errors = {
      name:
        input && input.author.name && input.author.name.trim() !== ""
          ? null
          : "Required field",
      quoteContents:
        input && input.en && input.en.trim() !== "" ? null : "Required field"
    };

    return !Object.keys(errors).some(k => errors[k] !== null);
    // returns true if all valid; returns false if 1+ errors
  }
</script>

<style>
  form {
    border-radius: 17px;
    background-color: #f4f4f4;
  }
</style>

<div class="form-wrapper p-3">

  <form on:submit|preventDefault={handleSubmit} class="p-3">

    <div class="form-group">
      <label for="author">Author's Name*</label>
      <input
        bind:value={input.author.name}
        type="text"
        class="form-control {authorClass}"
        placeholder="Enter name"
        id="author"
        autocomplete="off" />

      {#if errors !== null}
        {#if errors.name == null}
          <div class="valid-feedback">Valid.</div>
        {:else}
          <div class="invalid-feedback">{errors.name}</div>
        {/if}
      {/if}
    </div>

    <div class="form-group">
      <label for="quote-contents">Quote Contents*</label>

      <textarea
        bind:value={input.en}
        class="form-control {quoteContentsClass}"
        rows="5"
        id="quote-contents" />

      {#if errors !== null}
        {#if errors.quoteContents == null}
          <div class="valid-feedback">Valid.</div>
        {:else}
          <div class="invalid-feedback">{errors.quoteContents}</div>
        {/if}
      {/if}

    </div>

    <div class="form-group custom-control custom-switch">
      <input
        bind:checked={showRating}
        type="checkbox"
        class="custom-control-input"
        id="switch1" />
      <label class="custom-control-label" for="switch1">Include Rating</label>
    </div>

    {#if showRating}
      <div class="form-group">
        <label for="rating">Rating {input.rating}</label>
        <input
          bind:value={input.rating}
          type="range"
          class="custom-range"
          id="rating"
          name="rating"
          min="0"
          max="5"
          step="0.1" />
      </div>
    {/if}

    <button type="submit" class="btn btn-primary">Submit Quote</button>
  </form>
</div>

<!-- Button to Open the Modal -->
<button type="button" class="btn btn-success" on:click={toggleModal}>
  Generate Quote for me
</button>

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
          <h4 class="modal-title">Modal Heading</h4>
          <button type="button" class="close" on:click={toggleModal}>
            &times;
          </button>
        </div>

        <!-- Modal body -->
        <div class="modal-body">Modal body..</div>

        <!-- Modal footer -->
        <div class="modal-footer">
          <button class="btn btn-primary" on:click={handleClick}>
            Get Quote
          </button>
          <button type="button" class="btn btn-danger" on:click={toggleModal}>
            Close
          </button>
        </div>

      </div>
    </div>
  </div>

  <div class="modal-backdrop show" transition:fade />
{/if}
