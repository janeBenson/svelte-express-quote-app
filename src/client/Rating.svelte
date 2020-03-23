<script>
	export let rating; 
	
	let ratingRounded = Math.round(rating * 2) / 2
	
	function determineStars(rating) {
		let starArray = [];
		for (let i = 1; i <= 5; i++) {
			starArray.push({
				full: ratingRounded - i !== -0.5,
				checked: ratingRounded > i - 1
			})
		}
		return starArray
	}
	
	const starArray = determineStars(ratingRounded)

</script>

<style>
	.checked {
		color: orange;
		margin: 2px;
	}

</style>

{#each starArray as star}
	<span class="fa fa-star{!star.full ? '-half-o' : ''} {star.checked ? 'checked' : ''}"></span>
{/each}

