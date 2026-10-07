const { DataTypes } = require("sequelize");
const db = require("../config/bd");

const Usuario = db.define("Usuario", {

    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },

    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    }

});

module.exports = Usuario;
