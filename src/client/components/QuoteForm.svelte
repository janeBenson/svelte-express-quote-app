<script>
  export let input = {
    en: '',
    author: { name: '' },
  }
  export let onSubmit

  let authorClass = ''
  let errors = null
  let quoteContentsClass = ''
  let showRating = input.rating ? true : false

  async function handleSubmit() {
    if (!validateInput()) {
      return
    }
    await onSubmit()
    resetForm()
  }

  function validateInput() {
    errors = {
      name:
        input && input.author.name && input.author.name.trim() !== ''
          ? null
          : 'Required field',
      quoteContents:
        input && input.en && input.en.trim() !== '' ? null : 'Required field',
    }

    return !Object.keys(errors).some((k) => errors[k] !== null)
    // returns true if all valid; returns false if 1+ errors
  }

  function resetInput() {
    input = {
      en: '',
      author: { name: '' },
    }
  }

  function resetForm() {
    resetInput()
    showRating = false
    errors = null
  }

  $: {
    showRating
      ? input.rating
        ? ''
        : (input.rating = 0)
      : (input.rating = null)
    authorClass =
      errors !== null ? (errors.name ? 'is-invalid' : 'is-valid') : ''
    quoteContentsClass =
      errors !== null ? (errors.quoteContents ? 'is-invalid' : 'is-valid') : ''
  }
</script>

<style>

</style>

<form on:submit|preventDefault={handleSubmit} class="p-3">

  <div class="form-group">
    <label for="author">Author's Name*</label>
    <input
      bind:value={input.author.name}
      type="text"
      class="form-control {authorClass}"
      placeholder="Enter name"
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
      rows="5" />

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
        name="rating"
        min="0"
        max="5"
        step="0.1" />
    </div>
  {/if}
  <button type="submit" class="btn btn-primary">Save</button>
</form>
