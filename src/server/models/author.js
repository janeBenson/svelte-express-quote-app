module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('author', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('name', value.trim())
      },
    },
  })
  return Author
}
