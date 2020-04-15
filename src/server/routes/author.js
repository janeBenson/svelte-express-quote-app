module.exports = (app, db) => {
  // Get all authors
  app.get('/api/authors', async (req, res) => {
    try {
      const authors = await db.authors.findAll({
        where: {},
      })
      res.header('Content-Type', 'application/json')
      res.send(JSON.stringify(authors))
    } catch (error) {
      console.log(error)
      res.status(500).send()
    }
  })

  // Delete Author
  app.delete('/api/authors/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
      const author = await db.authors.findOne({
        where: { id },
      })

      if (!author) {
        return res.status(404).send()
      }

      // delete author from db
      await db.authors.destroy({
        where: { id },
      })

      res.send()
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  })
}
