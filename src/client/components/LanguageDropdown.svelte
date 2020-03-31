<script>
export let languages;
export let selectedLanguage;

</script>

<form class="form-inline">
    <select class="text-muted" bind:value={selectedLanguage}>
        {#each languages as lang}
            <option value={lang.code}>{lang.label}</option>
        {/each}
    </select>	
</form>	