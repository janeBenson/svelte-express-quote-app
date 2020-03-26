const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')

const dbPath = path.join(__dirname, '../../quotes.db')

const sequelize = new Sequelize({
    dialect: 'sqlite', 
    storage: dbPath
})

require('./quote')(sequelize, DataTypes) // init quotes table

sequelize.sync()

module.exports = sequelize
