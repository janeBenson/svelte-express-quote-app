async function getRandomQuote() {
  const url = "http://quotes.stormconsultancy.co.uk/random.json";
  try {
    let quote = await fetch(url);
    quote = await quote.json();
    return {
      en: quote.quote,
      author: { name: quote.author },
    };
  } catch (error) {
    console.log(error);
    console.log("hey there");
  }
}

module.exports = getRandomQuote;
