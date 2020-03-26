const cors = require('cors')
const express = require('express')

const sequelize = require('./models/sequelize') // initialize db

const app = express()
const port = 3000

app.use(cors())  
app.use(express.json()) // auto parse incoming JSON

require('./routes/quote')(app, sequelize) // initialize routes

app.listen(port, () => console.log(`Server is listening on port ${port}.`))

