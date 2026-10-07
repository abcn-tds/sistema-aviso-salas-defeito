const Sequelize = require("sequelize");
const db = require("../config/bd");

const Sala = db.define("salas", {

   
    numero: {
        type: Sequelize.STRING,
        allowNull: true
    },

  
    bloco: {
        type: Sequelize.STRING,
        allowNull: true
    },

   
  andar: {
    type: Sequelize.STRING,
    allowNull: true
},
    // Turma que utiliza a sala
  turma: {
    type: Sequelize.STRING,
    allowNull: true
},
    // Turno da turma
    turno: {
        type: Sequelize.STRING,
        allowNull: true
    },

   
    horario: {
        type: Sequelize.STRING,
        allowNull: true
    },

    // Quantidade máxima de alunos
    capacidade: {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    // Responsável pela sala
    responsavel: {
        type: Sequelize.STRING,
        allowNull: true
    },

    // Situação da sala
    status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "Disponível"
    },

    // Observações adicionais
    observacoes: {
        type: Sequelize.TEXT,
        allowNull: true
    }

});

module.exports = Sala;
