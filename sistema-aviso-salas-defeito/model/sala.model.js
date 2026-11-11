
const Sequelize = require("sequelize");
const db = require("../config/bd");

const Sala = db.define("salas", {

    numero: {
        type: Sequelize.STRING,
        allowNull: false
    },

    bloco: {
        type: Sequelize.STRING,
        allowNull: true
    },

    andar: {
        type: Sequelize.STRING,
        allowNull: true
    },

    turma: {
        type: Sequelize.STRING,
        allowNull: true
    },

    turno: {
        type: Sequelize.STRING,
        allowNull: true
    },

    horario: {
        type: Sequelize.STRING,
        allowNull: true
    },

    capacidade: {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    responsavel: {
        type: Sequelize.STRING,
        allowNull: true
    },

    status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "Disponível"
    },

    observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
    }

});

module.exports = Sala;
