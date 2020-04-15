<script>
  import Modal from './Modal.svelte'
  import Rating from './Rating.svelte'

  export let author
  export let image

  let quotes = []

  let showModal = false

  async function getAuthorQuotes() {
    try {
      let quoteData = await fetch(`/api/quotes?authorId=${author.id}`)
      quoteData = await quoteData.json()
      return quoteData
    } catch (error) {
      console.log(error)
    }
  }

  async function handleClick() {
    quotes = await getAuthorQuotes()
    showModal = true
  }
</script>

<style>

</style>

<div class="card bg-light text-dark">
  <img
    class="card-img-top img-fluid"
    src={image.download_url}
    alt="Card image" />
  <div class="card-body">
    <h4 class="card-title">{author.name}</h4>
    <button class="btn btn-primary text-light" on:click={handleClick}>
      See Quotes
    </button>
  </div>
</div>

<Modal bind:showModal>
  <span slot="title">{author.name}'s Quotes</span>
  <span slot="body">
    {#each quotes as quote}
      <div class="jumbotron mb-3 p-3">
        <p>"{quote.en}"</p>
        {#if quote.rating}
          <p>
            <Rating rating={quote.rating} />
          </p>
        {/if}
      </div>
    {/each}
  </span>
</Modal>
