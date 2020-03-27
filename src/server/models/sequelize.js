const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')

const dbPath = path.join(__dirname, '../quotes-app.db')

const sequelize = new Sequelize({
    dialect: 'sqlite', 
    storage: dbPath
})

// Connect all models/tables in db to a db object
// so everything is accessible via one object
const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize


// Models/tables
db.authors = require('./author')(db.sequelize, DataTypes) 
db.quotes = require('./quote')(db.sequelize, DataTypes)

// Relationships 
db.authors.hasMany(db.quotes) // each author can have many quotes
db.quotes.belongsTo(db.authors) // each quote belongs to one author

// sync db
sequelize.sync()

module.exports = db
