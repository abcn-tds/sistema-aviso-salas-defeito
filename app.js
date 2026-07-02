const express = require("express");
const { engine } = require("express-handlebars");

const db = require("./config/bd");
const Sala = require("./model/sala.model");
const Defeito = require("./model/defeito.model");

const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Banco
db.sync();

// ================= HOME =================

app.get("/", (req, res) => {
    res.render("home");
});

// ================= SALAS =================

// Listar
app.get("/salas", async (req, res) => {
    const salas = await Sala.findAll({ raw: true });
    res.render("listarSalas", { salas });
});

// Abrir cadastro
app.get("/salas/cadastrar", (req, res) => {
    res.render("cadastrarSala");
});

// Salvar
app.post("/salas/cadastrar", async (req, res) => {

    await Sala.create({
        numero: req.body.numero,
        bloco: req.body.bloco,
        responsavel: req.body.responsavel
    });

    res.redirect("/salas");
});

// ================= DEFEITOS =================

// Listar
app.get("/defeitos", async (req, res) => {

    const defeitos = await Defeito.findAll({ raw: true });

    res.render("listarDefeitos", { defeitos });

});

// Abrir cadastro
app.get("/defeitos/cadastrar", (req, res) => {

    res.render("cadastrarDefeito");

});

// Salvar
app.post("/defeitos/cadastrar", async (req, res) => {

    await Defeito.create({

        sala: req.body.sala,
        tipo: req.body.tipo,
        descricao: req.body.descricao,
        status: req.body.status

    });

    res.redirect("/defeitos");

});
// ================= EDITAR SALA =================

// Abrir tela de edição
app.get("/salas/editar/:id", async (req, res) => {

    const sala = await Sala.findByPk(req.params.id, { raw: true });

    res.render("editarSala", { sala });

});

// Salvar edição
app.post("/salas/editar", async (req, res) => {

    await Sala.update({

        numero: req.body.numero,
        bloco: req.body.bloco,
        responsavel: req.body.responsavel

    }, {

        where: {
            id: req.body.id
        }

    });

    res.redirect("/salas");

});

// Excluir sala
app.post("/salas/excluir/:id", async (req, res) => {

    await Sala.destroy({

        where: {
            id: req.params.id
        }

    });

    res.redirect("/salas");

});

// ================= EDITAR DEFEITO =================

// Abrir tela de edição
app.get("/defeitos/editar/:id", async (req, res) => {

    const defeito = await Defeito.findByPk(req.params.id, { raw: true });

    res.render("editarDefeito", { defeito });

});

// Salvar edição
app.post("/defeitos/editar", async (req, res) => {

    await Defeito.update({

        sala: req.body.sala,
        tipo: req.body.tipo,
        descricao: req.body.descricao,
        status: req.body.status

    }, {

        where: {
            id: req.body.id
        }

    });

    res.redirect("/defeitos");

});

// Excluir defeito
app.post("/defeitos/excluir/:id", async (req, res) => {

    await Defeito.destroy({

        where: {
            id: req.params.id
        }

    });

    res.redirect("/defeitos");

});

// ================= SERVIDOR =================

app.listen(3000, () => {

    console.log("Servidor rodando em http://localhost:3000");

});