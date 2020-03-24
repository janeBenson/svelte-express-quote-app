module.exports = (app, sequelize) => {
    const Quote = sequelize.models.Quote
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
}
