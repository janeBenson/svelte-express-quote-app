<script>
export let text
export let expanded=false
export let wordLimit=25

$: textShort = text.split(' ').slice(0, wordLimit).join(' ')
	
function toggleExpanded() {
	expanded = !expanded
}

</script>

{#if text === textShort}
	"{text}"
{:else if expanded}
	"{text}"
	<a href='/' on:click|preventDefault={toggleExpanded}>Show less</a>
{:else}
	"{textShort}..."
 <a href='/' on:click|preventDefault={toggleExpanded}>Show more</a>
{/if}