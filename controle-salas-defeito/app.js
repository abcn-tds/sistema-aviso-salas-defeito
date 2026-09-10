const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const bcrypt = require("bcrypt");

const db = require("./config/bd");
const Sala = require("./model/sala.model");
const Defeito = require("./model/defeito.model");
const Usuario = require("./model/usuario.model");

const app = express();

app.engine("handlebars", engine({
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
    secret: "controle-salas-segredo",
    resave: false,
    saveUninitialized: false
}));

// ================= BANCO =================

db.sync();


// ================= TELA INICIAL =================

app.get("/", (req, res) => {
    res.render("login");
});


// ================= CADASTRO DO ALUNO =================

// Abrir tela de cadastro
app.get("/cadastro/aluno", (req, res) => {
    res.render("cadastro-aluno");
});


// Salvar cadastro do aluno
app.post("/cadastro/aluno", async (req, res) => {

    try {

        const { nome, email, senha } = req.body;

        // Verifica se o e-mail já está cadastrado
        const usuarioExistente = await Usuario.findOne({
            where: {
                email: email
            }
        });

        if (usuarioExistente) {

            return res.render("cadastro-aluno", {
                erro: "Este e-mail já está cadastrado!"
            });

        }

        // Criptografa a senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Cria o aluno no banco
        await Usuario.create({
            nome: nome,
            email: email,
            senha: senhaCriptografada,
            tipo: "aluno"
        });

        // Depois do cadastro, vai para o login
        res.redirect("/login/aluno");

    } catch (erro) {

        console.log(erro);

        res.render("cadastro-aluno", {
            erro: "Erro ao criar cadastro."
        });

    }

});


// ================= LOGIN =================

// Login do aluno
app.get("/login/aluno", (req, res) => {
    res.render("login-aluno");
});


// Login do administrador
app.get("/login/admin", (req, res) => {
    res.render("login-admin");
});


// ================= HOME =================

app.get("/home", (req, res) => {

    if (!req.session.usuario) {
        return res.redirect("/");
    }

    res.render("home", {
        usuario: req.session.usuario
    });

});

// ================= LOGOUT =================

app.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/");
    });

});


// ================= AUTENTICAÇÃO =================

// Entrar como aluno
app.post("/login/aluno", async (req, res) => {

    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({
        where: {
            email: email,
            tipo: "aluno"
        }
    });

    if (!usuario) {

        return res.render("login-aluno", {
            erro: "E-mail ou senha incorretos."
        });

    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha
    );

    if (!senhaCorreta) {

        return res.render("login-aluno", {
            erro: "E-mail ou senha incorretos."
        });

    }

    req.session.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
    };

    res.redirect("/home");

});


// Entrar como administrador
app.post("/login/admin", async (req, res) => {

    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({
        where: {
            email: email,
            tipo: "admin"
        }
    });

    if (!usuario) {

        return res.render("login-admin", {
            erro: "E-mail ou senha incorretos."
        });

    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha
    );

    if (!senhaCorreta) {

        return res.render("login-admin", {
            erro: "E-mail ou senha incorretos."
        });

    }

    req.session.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
    };

    res.redirect("/home");

});


// ================= SALAS =================

// Listar salas
app.get("/salas", async (req, res) => {

    const salas = await Sala.findAll({
        raw: true
    });

    res.render("listarSalas", {
        salas
    });

});


// Abrir cadastro de sala
app.get("/salas/cadastrar", (req, res) => {

    res.render("cadastrarSala");

});


// Salvar sala
app.post("/salas/cadastrar", async (req, res) => {

    await Sala.create({
        numero: req.body.numero,
        bloco: req.body.bloco,
        responsavel: req.body.responsavel
    });

    res.redirect("/salas");

});


// ================= DEFEITOS =================

// Listar defeitos
app.get("/defeitos", async (req, res) => {

    const defeitos = await Defeito.findAll({
        raw: true
    });

    res.render("listarDefeitos", {
        defeitos
    });

});


// Abrir cadastro de defeito
app.get("/defeitos/cadastrar", (req, res) => {

    res.render("cadastrarDefeito");

});


// Salvar defeito
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

    const sala = await Sala.findByPk(
        req.params.id,
        {
            raw: true
        }
    );

    res.render("editarSala", {
        sala
    });

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

    const defeito = await Defeito.findByPk(
        req.params.id,
        {
            raw: true
        }
    );

    res.render("editarDefeito", {
        defeito
    });

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