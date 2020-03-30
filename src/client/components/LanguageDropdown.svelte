<script>
export let languages;
export let selectedLanguage;

</script>

<div class="language-dropdown">
    <select bind:value={selectedLanguage}>
        {#each languages as lang}
            <option value={lang.code}>{lang.label}</option>
        {/each}
    </select>		
</div>