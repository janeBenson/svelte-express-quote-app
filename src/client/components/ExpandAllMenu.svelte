<script>
  export let expanded;
</script>

<style>

</style>

<div class="form-inline">
  <select class="form-control text-muted" bind:value={expanded}>
    <option value={true}>Expand All</option>
    <option value={false}>Collapse All</option>
  </select>
</div>
