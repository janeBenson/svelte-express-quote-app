const nodeFetch = require('node-fetch')

async function randomText(wordCount) {
    const url = `http://www.randomtext.me/api/gibberish/p-1/${wordCount}`

    const res = await nodeFetch(url)
    const json = await res.json() 
    const text = json.text_out.replace('<p>', '').replace('</p>\r', '')
    
    return text
}

module.exports = randomText