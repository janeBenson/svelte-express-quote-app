const randomText = require('../utils/randomText')

module.exports = (app, db) => {

    // Create Quote
    app.post('/api/quotes', async (req, res) => {
        const quote = req.body

        try {
            const gibberish = await randomText(quote.en.split(' ').length)

            let author = await db.authors.findOne({
                where: { name: quote.author.name }
            })

            if (!author) {
                // create new author  
                author = await db.authors.create({
                    name: quote.author.name
                })
            } 
            // create new quote w/existing author id
            await db.quotes.create({
                en: quote.en,
                gib: gibberish,
                rating: quote.rating, 
                authorId: author.id
            })

            res.status(201).send()

        } catch(error) {
            console.log(error)
            res.status(500).send()
        }
    })

    // Get Quote
    app.get('/api/quotes/:id', async (req, res) => {
        const id = parseInt(req.params.id)
        try {
            const quote = await db.quotes.findOne({ 
                where: { id },
                include: db.authors // eager load the author
            })

            if (!quote) {
                return res.status(404).send() 
            }

            res.send(quote)
            /*
                quote: 
                {
                    en: ....
                    gib: ....
                    rating: ....
                    author: {name: ....}
                    ...
                }
            
            */

        } catch (error) {
            console.log(error) 
            res.status(500).send()
        }
    })

    // Get All Quotes
    app.get('/api/quotes', async (req, res) => {
        try {
            const quotes = await db.quotes.findAll({
                where: {},
                include: db.authors // eager load author
            })
            res.header("Content-Type",'application/json')
            res.send(JSON.stringify(quotes))

        } catch (error) {
            console.log(error) 
            res.status(500).send()
        }
    })

    // Update Quote
    app.put('/api/quotes/:id', async (req, res) => {
        const id = parseInt(req.params.id)
        const allowedQuoteUpdates = ['en', 'gib', 'rating']
    
        try {
            const quote = await db.quotes.findOne({ where: { id } })
    
            if (!quote) {
                // quote not found
                return res.status(404).send()
            }

            // update quote properties 
            allowedQuoteUpdates.forEach((update) => {
                quote[update] = req.body[update]
            })

            quote.save() // save quote properties to db

            // update author 
            const author = await db.authors.findOne({ 
                where: { name: req.body.author.name }
            })

            if (!author) {
                // create new author in db 
                quote.createAuthor({ name: req.body.author.name })

            } else {
                // set author on quote 
                quote.setAuthor(author)
            }

            res.send()
            
        } catch (error) {
            // server related issue or validation related issue
            res.status(400).send(error)
        }  
    })

    // Delete Quote
    app.delete('/api/quotes/:id', async (req, res) => {
        const id = parseInt(req.params.id)
        try {
            const quote = await db.quotes.findOne({ 
                where: { id },
                include: db.authors // eager load
            })

            if (!quote) {
                // quote does not exist
                return res.status(404).send()
            }

            // delete quote from db
            await db.quotes.destroy({
                where: { id }
            })

            // delete author from db if author doesn't have any existing quotes
            console.log('Author Quote Count: ', await quote.author.countQuotes()) // remove
            if (await quote.author.countQuotes() === 0) {
                await db.authors.destroy({
                    where: { id: quote.author.id }
                })
            }

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
            db.quotes.create({ 
                author: quote.author.name,
                gib: quote.gib,
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
}
