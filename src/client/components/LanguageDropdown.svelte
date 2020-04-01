<script>
  export let languages;
  export let selectedLanguage;
</script>

<div class="form-inline">
  <select class="form-control text-muted" bind:value={selectedLanguage}>
    {#each languages as lang}
      <option value={lang.code}>{lang.label}</option>
    {/each}
  </select>
</div>
