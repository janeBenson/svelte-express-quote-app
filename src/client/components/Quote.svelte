<script>
	import { fade } from 'svelte/transition';
	
	import Rating from './Rating.svelte'
	import LongText from './LongText.svelte'

	export let quote; 
	export let selectedLanguage;
	export let expanded;
	export let onQuoteDelete;

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

<div class='quote' id={quote.id} transition:fade|local>
	
	<div class="author">
		{quote.author.name}
	</div>
	
	<div class="quote-contents">
		<LongText text={quote[selectedLanguage]} {expanded} />
	</div>
	
	{#if quote.rating !== null }
		<div class="rating">	
			<Rating rating={quote.rating} /> 
		</div>
	{/if}

	<a href='/' on:click|preventDefault={deleteQuote}><i class="fa fa-trash"></i></a>
	
</div>