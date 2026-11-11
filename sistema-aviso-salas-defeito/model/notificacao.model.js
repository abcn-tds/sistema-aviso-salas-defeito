const Sequelize = require("sequelize");
const db = require("../config/bd");

const Notificacao = db.define("notificacoes", {

    usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    mensagem: {
        type: Sequelize.TEXT,
        allowNull: false
    },

    lida: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }

});

module.exports = Notificacao;