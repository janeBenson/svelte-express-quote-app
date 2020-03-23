const express = require('express')
const cors = require('cors')

const data = require('./data.json')

const app = express()
const port = 3000

app.use(cors())  

app.get('/api/quotes', (req, res) => {
    res.header("Content-Type",'application/json')
    res.send(JSON.stringify(data))
})

app.listen(port, () => console.log(`Server is listening on port ${port}.`))