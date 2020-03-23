<script>
	export let quote; 
	export let selectedLang;
	export let expanded;
	
	import Rating from './Rating.svelte'
	import LongText from './LongText.svelte'


	
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
	
</div>