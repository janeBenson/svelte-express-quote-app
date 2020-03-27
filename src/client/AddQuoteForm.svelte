<script>
  export let onQuoteAdded;

  let input; 
  resetInput()

  async function handleSubmit(event) {
    await fetch('http://localhost:3000/api/quotes', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })
    onQuoteAdded()
    resetInput() 
  }

  function resetInput() {
    input = {
        en: '', 
        rating: 0, 
        author: { name: '' }
      }
  }

</script>
<form on:submit|preventDefault={handleSubmit}>
  <label for="author">First name:</label><br>
  <input bind:value={input.author.name} required type="text" id="author">

  <label for="quote">Add your quote</label>
  <textarea bind:value={input.en} id="quote"></textarea>

  <label for="rating">Rating</label>
  <span>{input.rating}</span> <input bind:value={input.rating} type="range" id="rating" min="0" max="5" step="0.5"/>
  
  <button type="submit">Add Quote</button>
</form>