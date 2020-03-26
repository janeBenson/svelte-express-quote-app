module.exports = (sequelize, DataTypes) => {

  const Quote = sequelize.define('quote', {
    gib: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    en: {
        type: DataTypes.TEXT, 
        allowNull: false
      },
    rating: {
        type: DataTypes.DECIMAL,
        allowNull: true
    }
  })
  return Quote
}