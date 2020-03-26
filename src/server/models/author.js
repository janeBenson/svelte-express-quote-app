module.exports = (sequelize, DataTypes) => {
    const Author = sequelize.define('author', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
    return Author
  }