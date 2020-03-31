<script>
export let expanded; 

</script>
<style>

</style>

<form class="form-inline">
    <select class="form-control text-muted" type="button" bind:value={expanded}>
        <option value={true}>Expand All</option> 
        <option value={false}>Collapse All</option>
    </select>
</form>

