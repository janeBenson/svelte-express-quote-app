const cors = require('cors')
const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3').verbose() // provides more detailed stack track
const Sequelize = require('sequelize')

const data = require('./data.json')

const app = express()
const port = 3000
const dbPath = path.join(__dirname, '../../app.db')

const sequelize = new Sequelize({
    dialect: 'sqlite', 
    storage: dbPath
})

// Quote Model
const Quote = sequelize.define('quote', {
    // attributes
    author: {
      type: Sequelize.STRING,
      allowNull: false
    },
    sr: {
      type: Sequelize.TEXT, 
      allowNull: false
    },
    en: {
        type: Sequelize.TEXT, 
        allowNull: false
      },
    rating: {
        type: Sequelize.DECIMAL,
        allowNull: true
    }
  }, {
    // options
  });


// sync all models with db
sequelize.sync()

app.use(cors())  
app.use(express.json()) // auto parse incoming JSON

// add quote 
app.post('/api/quotes', async (req, res) => {
    const quote = req.body
    try {
        await Quote.create({
            author: quote.author,
            sr: quote.sr,
            en: quote.en,
            rating: quote.rating
        })
        res.status(201).send()

    } catch(error) {
        console.log(error)
        res.status(500).send()
    }
})

// get all quotes
app.get('/api/quotes', async (req, res) => {
    let quotes = await Quote.findAll()

    res.header("Content-Type",'application/json')
    res.send(JSON.stringify(quotes))
})

// delete quote
app.delete('/api/quotes/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const quote = await Quote.findAll({ where: { id } })
        if (!quote) {
            return res.status(404).send()
        }
        await Quote.destroy({
            where: { id }
        })
        res.send(quote)

    } catch (error) {
        console.log(error) 
        res.sendStatus(500)
    }

})

// seed db with initial data
app.post('/api/seed-quotes', (req, res) => {
    const data = req.body

    for (let i = 0; i < data.length; i++) {
        const quote = data[i]
        Quote.create({ 
            author: quote.author,
            sr: quote.sr,
            en: quote.en,
            rating: quote.rating 
        })
        .then(quote => {
            console.log(`Quote ${quote.id} has been added`);
        });
    }
    res.status(201).send()
})

// delete all db data
app.delete('/api/quotes', async (req, res) => {
    try {
        await Quote.destroy({
            where: {}
        })
        res.send()

    } catch (error) {
        console.log(error) 
        res.status(400).send()
    }
})


app.listen(port, () => console.log(`Server is listening on port ${port}.`))
