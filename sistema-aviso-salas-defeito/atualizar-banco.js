
const db = require("./config/bd");

async function atualizarBanco() {
    try {
        const [resultado] = await db.query(
            "PRAGMA table_info(defeitos)"
        );

        const existe = resultado.some(
            coluna => coluna.name === "responsavel"
        );

        if (!existe) {
            await db.query(
                "ALTER TABLE defeitos ADD COLUMN responsavel VARCHAR(255)"
            );

            console.log("Coluna responsavel adicionada!");
        } else {
            console.log("A coluna responsavel já existe!");
        }

    } catch (erro) {
        console.log("Erro ao atualizar banco:", erro);
    } finally {
        await db.close();
    }
}

atualizarBanco();
