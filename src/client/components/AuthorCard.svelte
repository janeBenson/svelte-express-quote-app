<script>
  export let author;
  export let image;

  async function getAuthorQuotes() {
    try {
      let quoteData = await fetch(`/api/quotes?authorId=${author.id}`);
      quoteData = await quoteData.json();
      return quoteData;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleClick() {
    const quotes = await getAuthorQuotes();
    console.log(quotes);
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
