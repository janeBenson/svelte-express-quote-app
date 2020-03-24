module.exports = (sequelize, DataTypes) => {
    const Quote = sequelize.define('Quote', {
        // attributes
        author: {
          type: DataTypes.STRING,
          allowNull: false
        },
        sr: {
          type: DataTypes.TEXT, 
          allowNull: false
        },
        en: {
            type: DataTypes.TEXT, 
            allowNull: false
          },
        rating: {
            type: DataTypes.DECIMAL,
            allowNull: true
        }
      }, {
        // options
      });
}