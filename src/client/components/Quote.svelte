<script>
  import { fade } from 'svelte/transition'

  import LongText from './LongText.svelte'
  import Modal from './Modal.svelte'
  import QuoteForm from './QuoteForm.svelte'
  import Rating from './Rating.svelte'

  export let quote
  export let selectedLanguage
  export let expanded
  export let onQuoteDelete
  export let onQuoteUpdate

  let input
  let showModal = false

  function canCloseModal() {
    if (input != quote) {
      // user edited quote
      if (confirm('Are you sure you want to exit? Your changes will be lost')) {
        return true
      } else {
        return false
      }
    } else {
      // user didn't make any changes
      return true
    }
  }

  async function deleteQuote() {
    try {
      await fetch(`http://localhost:3000/api/quotes/${quote.id}`, {
        method: 'DELETE',
      })
      onQuoteDelete()
    } catch (error) {
      console.log(error)
    }
  }

  async function onSubmit() {
    try {
      await fetch(`http://localhost:3000/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      showModal = false
      onQuoteUpdate()
    } catch (error) {
      console.log(error)
    }
  }

  function openQuoteForm() {
    input = { ...quote }
    showModal = true
  }
</script>

<style>
  .quote {
    background-color: #eee;
    color: #444;
    padding: 18px;
    margin: 15px;
    border: none;
    outline: none;
  }

  .author {
    font-size: 30px;
  }

  .quote-contents {
    padding: 2px;
  }

  .rating {
    font-size: 18px;
  }
</style>

<div class="quote" id={quote.id} transition:fade|local>

  <div class="author">{quote.author.name}</div>

  <div class="quote-contents">
    <LongText text={quote[selectedLanguage]} {expanded} />
  </div>

  {#if quote.rating !== null}
    <div class="rating">
      <Rating rating={quote.rating} />
    </div>
  {/if}

  <a class="p-1" href="/" on:click|preventDefault={deleteQuote}>
    <i class="fa fa-trash" />
  </a>

  <a href="/" on:click|preventDefault={openQuoteForm}>
    <i class="fa fa-pencil" />
  </a>

</div>

<Modal bind:showModal {canCloseModal}>
  <span slot="title">Update Quote</span>
  <span slot="body">
    <QuoteForm bind:input {onSubmit} />
  </span>
</Modal>
