module.exports = (app, db) => {

    // Get all authors 
    app.get('/api/authors', async (req, res) => {
        try {
            const authors = await db.authors.findAll({
                where: {}
            })
            res.header("Content-Type",'application/json')
            res.send(JSON.stringify(authors))

        } catch (error) {
            console.log(error) 
            res.status(500).send()
        }
    })
}