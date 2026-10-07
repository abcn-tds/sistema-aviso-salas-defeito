const Sequelize = require("sequelize");
const db = require("../config/bd");

const Defeito = db.define("defeitos", {

    
    sala: {
        type: Sequelize.STRING,
        allowNull: false
    },

    
    tipo: {
        type: Sequelize.STRING,
        allowNull: false
    },

    
    descricao: {
        type: Sequelize.TEXT,
        allowNull: false
    },

   
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Pendente"
    }

});

module.exports = Defeito;
