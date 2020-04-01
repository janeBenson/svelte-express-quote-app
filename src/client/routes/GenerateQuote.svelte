<script>
  import getRandomQuote from "../services/getRandomQuote.js";

  let quote = {};
  let showQuote = false;

  async function handleClick() {
    const data = await getRandomQuote();
    quote = data; // set quote after so pending promise data doesn't show in UI
    if (!showQuote) {
      showQuote = true;
    }
  }
</script>

<style>

</style>

<div class="generate-quote pt-4">

  <button class="btn btn-primary btn-block btn-lg" on:click={handleClick}>
    Generate Random Quote
  </button>

  {#if showQuote}
    <div class="jumbotron mt-3">
      <h1>{quote.author.name}</h1>
      <p>{quote.en}</p>
    </div>
  {/if}

</div>
