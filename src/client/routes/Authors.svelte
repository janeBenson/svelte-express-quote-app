<script>
  import fetchAuthors from '../services/fetchAuthors.js'
  import fetchRandomImg from '../services/fetchRandomImg.js'
  import { sortArrayByName } from '../services/sortArray.js'

  import AuthorCard from '../components/AuthorCard.svelte'

  let authors = []
  let images = []

  async function getAuthors() {
    let authorData = await fetchAuthors()
    let imageData = await fetchRandomImg(authorData.length) // store actual photos in the future
    // alphabetize authors
    authorData = sortArrayByName(authorData)

    authors = authorData
    images = imageData
  }

  getAuthors()
</script>

<style>

</style>

<div class="card-columns mt-2">

  {#each authors as author, i}
    <AuthorCard {author} image={images[i]} />
  {/each}

</div>
