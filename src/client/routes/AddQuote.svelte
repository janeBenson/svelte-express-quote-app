<script>
  // export let onQuoteAdded;

  let input; 
  let includeRating = false;

  resetInput()

  $: {
    includeRating ? input.rating = 0 : input.rating = null
  }

  async function handleSubmit(event) {
    await fetch('http://localhost:3000/api/quotes', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })

    resetForm()  

  }

  function resetInput() {
    input = {
        en: '',
        author: { name: '' }
      }
  }

  function resetForm() {
    resetInput() 
    includeRating = false
  }

</script>

<style>
  form {
    border-radius: 17px;
    background-color: #f4f4f4;
  }
</style>

<div class="form-wrapper p-2">

  <form on:submit|preventDefault={handleSubmit} class="was-validated p-3">

    <div class="form-group">
      <label for="author">Author's Name*</label>
      <input bind:value={input.author.name} type="text" class="form-control" placeholder="Enter name" id="author" required>
      <div class="valid-feedback">Valid.</div>
      <div class="invalid-feedback">Please fill out this field.</div>
    </div>

    <div class="form-group">
      <label for="quote-contents">Quote Contents*</label>
      <textarea bind:value={input.en} class="form-control" rows="5" id="quote-contents" required></textarea>
      <div class="valid-feedback">Valid.</div>
      <div class="invalid-feedback">Please fill out this field.</div>
    </div>

    <div class="form-group custom-control custom-switch">
      <input bind:checked={includeRating} type="checkbox" class="custom-control-input" id="switch1">
      <label class="custom-control-label" for="switch1">Include Rating</label>
    </div>

    {#if includeRating}
      <div class="form-group">
        <label for="rating">Rating {input.rating}</label>
        <input bind:value={input.rating} type="range" class="custom-range" id="rating" name="rating" min="0" max="5" step="0.1">
      </div>
    {/if}

    <button type="submit" class="btn btn-primary">Submit Quote</button>

  </form>
</div>