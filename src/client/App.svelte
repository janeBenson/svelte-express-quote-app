<script>
	import AddQuoteForm from './AddQuoteForm.svelte'
	import Quote from './Quote.svelte'
	import Search from './Search.svelte'
	
	const url = 'http://localhost:3000/api/quotes'
	
	const languages = [
		{code: 'en', label: 'English'}, 
		{code: 'gib', label: 'Gibberish'}
	]
	let quotes = []; // need this to overcome array error for Each block
	let quotesFiltered = []
	let selectedLang;
	let expanded = false; 
	let authors = [];
	let selectedAuthors = [];
	let search;
	
	$: quotes, search, selectedAuthors, selectedLang, setQuotesFiltered()

	getQuotes()
	
	async function getQuotes() {
		try {
			const res = await fetch(url)
			quotes = await res.json()	
			authors = getAuthors(quotes).sort()
			
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
		return authors
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
			return quote.author.name.toLowerCase().includes(searchInput) || quote[selectedLang].toLowerCase().includes(searchInput)		
		} 
		return true
	}
	
	function quoteMeetsFilters(quote) {
		return searchFilter(quote) && authorFilter(quote)
	}
	
	function setQuotesFiltered() {
		quotesFiltered = quotes.filter(quoteMeetsFilters)
	}

	async function onQuoteDelete(id) {
		alert('Quote deleted!')
		await getQuotes()
	}

	async function onQuoteAdded() {
		alert('your quote has been added!')
		await getQuotes()
	}

</script>

<style>
	:global(body) {
		color: #717070;
	}
	.heading-content {
		vertical-align: center;
		margin: 6px;
	}
	.heading-content > #page-title {
		color: #645e64;
	}
	#language-dropdown > select {
		float: right;
	}
	
</style>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<div class="row heading-content">
	<div id='page-title' class="col-sm-9">
		<h1>Programming quotes</h1>		
	</div>
	
	<div id='language-dropdown' class="col-sm-3">
		<select bind:value={selectedLang}>
			{#each languages as lang}
				<option value={lang.code}>{lang.label}</option>
			{/each}
		</select>			
	</div>
</div>

<select bind:value={expanded}>
	<option value={true}>Expand All</option> 
	<option value={false}>Collapse All</option>
</select>			

<select multiple bind:value={selectedAuthors}>
	{#each authors as author}
		<option value={author}>{author}</option>
	{/each}
</select>	

<Search bind:search />

<AddQuoteForm {onQuoteAdded} />

<div class="quotes"> 
	{#each quotesFiltered as quote (quote.id)} <!-- need keyed each because we are filtering quotes -->
			<Quote {quote} {selectedLang} {expanded} {onQuoteDelete} />
	{/each}
</div>



