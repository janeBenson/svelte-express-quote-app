<script>
  import ExpandAllMenu from '../components/ExpandAllMenu.svelte'
  import LanguageDropdown from '../components/LanguageDropdown.svelte'
  import Quote from '../components/Quote.svelte'
  import Search from '../components/Search.svelte'

  const url = 'http://localhost:3000/api/quotes'

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'gib', label: 'Gibberish' },
  ]

  let quotes = []
  let quotesFiltered = []
  let selectedLanguage = 'en'
  let expanded = false
  let authors = []
  let selectedAuthors = []
  let search
  let showAuthorDropdown = false

  $: quotes, search, selectedAuthors, selectedLanguage, setQuotesFiltered()

  getQuotes()

  async function getQuotes() {
    try {
      const res = await fetch(url)
      quotes = await res.json()
      authors = getAuthors(quotes)
    } catch (error) {
      console.log(error)
    }
  }

  function getAuthors(quotes) {
    let authors = []

    for (let i = 0; i < quotes.length; i++) {
      if (authors.includes(quotes[i].author.name)) {
        continue
      } else {
        authors.push(quotes[i].author.name)
      }
    }

    return authors.sort()
  }

  function authorFilter(quote) {
    if (selectedAuthors.length > 0) {
      return selectedAuthors.includes(quote.author.name)
    }
    return true
  }

  function searchFilter(quote) {
    if (search) {
      let searchInput = search.toLowerCase()
      return (
        quote.author.name.toLowerCase().includes(searchInput) ||
        quote[selectedLanguage].toLowerCase().includes(searchInput)
      )
    }
    return true
  }

  function quoteMeetsFilters(quote) {
    return searchFilter(quote) && authorFilter(quote)
  }

  function setQuotesFiltered() {
    quotesFiltered = quotes.filter(quoteMeetsFilters)
  }

  async function onQuoteDelete() {
    alert('Quote deleted!')
    await getQuotes()
  }

  async function onQuoteUpdate() {
    await getQuotes()
  }

  function toggleAuthorDropdown() {
    showAuthorDropdown = !showAuthorDropdown
  }
</script>

<style>
  .filter-bar {
    background-color: #f4f4f4;
    border-bottom: 1px solid #e5e5e5;
  }

  .white-background {
    background-color: white;
  }
</style>

<!-- Filter Bar -->
<div class="filter-bar d-flex justify-content-between p-2">

  <!-- Search Bar -->
  <form class="form-inline">
    <Search bind:search />
  </form>

  <!-- Author Dropdown -->
  <div class="dropdown">
    <button
      type="button"
      class="btn btn-outline-secondary dropdown-toggle white-background"
      on:click={toggleAuthorDropdown}>
      Authors
    </button>

    {#if showAuthorDropdown}
      <div class="dropdown-menu show p-1">
        {#each authors as author}
          <div class="form-check">
            <label class="form-check-label">
              <input
                type="checkbox"
                class="form-check-input"
                value={author}
                bind:group={selectedAuthors} />
              {author}
            </label>
          </div>
        {/each}
      </div>
    {/if}

  </div>

  <!-- Expand/Collapse menu -->
  <ExpandAllMenu bind:expanded />

  <!-- Language Dropdown -->
  <LanguageDropdown {languages} bind:selectedLanguage />

</div>

<div class="quotes">
  {#each quotesFiltered as quote (quote.id)}
    <!-- need keyed each because we are filtering quotes in UI -->
    <Quote
      {quote}
      {selectedLanguage}
      {expanded}
      {onQuoteDelete}
      {onQuoteUpdate} />
  {/each}
</div>
