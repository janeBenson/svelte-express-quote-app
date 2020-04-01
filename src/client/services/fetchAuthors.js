async function fetchAuthors() {
  try {
    const res = await fetch("/api/authors");
    const authors = await res.json();
    return authors;
  } catch (error) {
    console.log(error);
  }
}

module.exports = fetchAuthors;
