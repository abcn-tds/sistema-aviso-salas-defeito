const bcrypt = require("bcrypt");
const db = require("./config/bd");
const Usuario = require("./model/usuario.model");

async function criarAdmin() {

    const senhaCriptografada = await bcrypt.hash("123456", 10);

    await Usuario.findOrCreate({
        where: {
            email: "admin@gmail.com"
        },
        defaults: {
            nome: "Administrador",
            senha: senhaCriptografada,
            tipo: "admin"
        }
    });

    console.log("Administrador criado com sucesso!");

    process.exit();
}

criarAdmin();