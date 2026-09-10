const Sequelize = require("sequelize");
const db = require("../config/bd");

const Sala = db.define("salas", {
  numero: {
    type: Sequelize.STRING,
    allowNull: false
  },
  bloco: {
    type: Sequelize.STRING,
    allowNull: false
  },
  responsavel: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Sala;