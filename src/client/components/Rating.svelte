<script>
	export let rating; 
	
	function determineStars(rating) {
		const ratingRounded = Math.round(rating * 2) / 2
		let starArray = [];
		for (let i = 1; i <= 5; i++) {
			starArray.push({
				full: ratingRounded - i !== -0.5,
				checked: ratingRounded > i - 1
			})
		}
		return starArray
	}

</script>

<style>
	.checked {
		color: orange;
		margin: 2px;
	}

</style>

{#each determineStars(rating) as star}
	<span class="fa fa-star{!star.full ? '-half-o' : ''} {star.checked ? 'checked' : ''}"></span>
{/each}

