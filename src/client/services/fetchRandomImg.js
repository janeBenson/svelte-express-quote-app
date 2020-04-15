async function fetchRandomImg(num) {
  const url = `https://picsum.photos/v2/list?page=1&limit=${num}`
  try {
    let images = await fetch(url)
    images = await images.json()
    return images
  } catch (error) {
    console.log(error)
  }
}

module.exports = fetchRandomImg
