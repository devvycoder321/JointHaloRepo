const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'halo.db'),
  logging: false, // Set to console.log for debug
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
