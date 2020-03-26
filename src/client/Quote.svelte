<script>
	export let quote; 
	export let selectedLang;
	export let expanded;
	export let onQuoteDelete;
	
	import Rating from './Rating.svelte'
	import LongText from './LongText.svelte'

	async function deleteQuote() {
		try {
			await fetch(`http://localhost:3000/api/quotes/${quote.id}`, {method: 'DELETE'})
			onQuoteDelete(quote.id)

		} catch (error) {
			console.log(error)
		}
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

<div class='quote' id={quote.id}>
	
	<div class="author">
		{quote.author}
	</div>
	
	<div class="quote-contents">
		<LongText text={quote[selectedLang]} {expanded} />
	</div>
	
	{#if quote.rating}
	<div class="rating">	
		<Rating rating={quote.rating} /> 
	</div>
	{/if}

	<a href='/' on:click|preventDefault={deleteQuote}><i class="fa fa-trash"></i></a>
	
</div>