<script>
  import { fly, fade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'

  import QuoteForm from '../components/QuoteForm.svelte'

  import getRandomQuote from '../services/getRandomQuote.js'

  let input = {
    en: '',
    author: { name: '' },
  }
  let showModal = false
  let fetchedQuote

  async function handleClick() {
    fetchedQuote = await getRandomQuote()
    input.en = fetchedQuote.en
    input.author.name = fetchedQuote.author.name
  }

  async function onSubmit() {
    try {
      await fetch('http://localhost:3000/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
    } catch (error) {
      console.log(error)
    }
  }
</script>

<style>
  .form-wrapper {
    border-radius: 17px;
    background-color: #f4f4f4;
  }
</style>

<div class="form-wrapper p-3">
  <QuoteForm bind:input {onSubmit} />
</div>

<button type="button" class="btn btn-success" on:click={handleClick}>
  Generate Quote for me
</button>
