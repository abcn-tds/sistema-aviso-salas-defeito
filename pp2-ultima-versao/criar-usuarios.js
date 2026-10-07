const bcrypt = require("bcrypt");
const Usuario = require("./model/usuario.model");

async function atualizarAdmin() {
    try {
        const senhaCriptografada = await bcrypt.hash("20082009", 10);

        const admin = await Usuario.findOne({
            where: {
                tipo: "admin"
            }
        });

        if (admin) {
            admin.email = "adm09@gmail.com";
            admin.senha = senhaCriptografada;
            admin.tipo = "admin";

            await admin.save();

            console.log("================================");
            console.log("ADMINISTRADOR ATUALIZADO!");
            console.log("E-mail: adm09@gmail.com");
            console.log("Senha: 20082009");
            console.log("================================");
        } else {
            await Usuario.create({
                nome: "Administrador",
                email: "adm09@gmail.com",
                senha: senhaCriptografada,
                tipo: "admin"
            });

            console.log("================================");
            console.log("ADMINISTRADOR CRIADO!");
            console.log("E-mail: adm09@gmail.com");
            console.log("Senha: 20082009");
            console.log("================================");
        }

        process.exit();
    } catch (erro) {
        console.log("ERRO:", erro);
        process.exit(1);
    }
}

atualizarAdmin();