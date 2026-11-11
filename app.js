
const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const bcrypt = require("bcrypt");

const db = require("./config/bd");
const Sala = require("./model/sala.model");
const Defeito = require("./model/defeito.model");
const Usuario = require("./model/usuario.model");

const app = express();

// ================= CONFIGURAÇÃO =================

app.engine(
    "handlebars",
    engine({
        helpers: {
            eq: (a, b) => a === b
        }
    })
);

app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
    session({
        secret: "controle-salas-segredo",
        resave: false,
        saveUninitialized: false
    })
);

// ================= BANCO DE DADOS =================

db.sync()
    .then(() => {
        console.log("Banco de dados conectado e atualizado!");
    })
    .catch((erro) => {
        console.log("Erro ao conectar com o banco:", erro);
    });

// ================= FUNÇÕES DE SEGURANÇA =================

function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/");
    }

    next();
}

function somenteAluno(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/");
    }

    if (req.session.usuario.tipo !== "aluno") {
        return res.redirect("/home");
    }

    next();
}

function somenteAdmin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/");
    }

    if (req.session.usuario.tipo !== "admin") {
        return res.redirect("/home");
    }

    next();
}

// ================= TELA INICIAL =================

app.get("/", (req, res) => {
    res.render("login");
});

// ================= CADASTRO DO ALUNO =================

app.get("/cadastro/aluno", (req, res) => {
    res.render("cadastro-aluno");
});

app.post("/cadastro/aluno", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        const usuarioExistente = await Usuario.findOne({
            where: { email: email }
        });

        if (usuarioExistente) {
            return res.render("cadastro-aluno", {
                erro: "Este e-mail já está cadastrado!"
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await Usuario.create({
            nome: nome,
            email: email,
            senha: senhaCriptografada,
            tipo: "aluno"
        });

        res.redirect("/login/aluno");

    } catch (erro) {
        console.log(erro);

        res.render("cadastro-aluno", {
            erro: "Erro ao criar cadastro."
        });
    }
});

// ================= LOGIN =================

app.get("/login/aluno", (req, res) => {
    res.render("login-aluno");
});

app.get("/login/admin", (req, res) => {
    res.render("login-admin");
});

// ================= LOGIN DO ALUNO =================

app.post("/login/aluno", async (req, res) => {
    try {
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

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

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

    } catch (erro) {
        console.log(erro);

        res.render("login-aluno", {
            erro: "Erro ao realizar login."
        });
    }
});

// ================= LOGIN DO ADMINISTRADOR =================

app.post("/login/admin", async (req, res) => {
    try {
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

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

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

    } catch (erro) {
        console.log(erro);

        res.render("login-admin", {
            erro: "Erro ao realizar login."
        });
    }
});

// ================= HOME =================

app.get("/home", verificarLogin, (req, res) => {
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

// ======================================================
// ================= SALAS ==============================
// ======================================================

// ================= LISTAR SALAS ======================

app.get("/salas", somenteAdmin, async (req, res) => {
    try {
        const salas = await Sala.findAll({
            raw: true
        });

        res.render("listarSalas", {
            salas: salas,
            pesquisa: ""
        });

    } catch (erro) {
        console.log("ERRO AO LISTAR SALAS:", erro);
        res.send("Erro ao listar salas.");
    }
});

// ================= PESQUISAR SALA =====================

app.get("/salas/pesquisar", somenteAdmin, async (req, res) => {
    try {
        const numeroPesquisado = req.query.numero;

        const salas = await Sala.findAll({
            raw: true
        });

        const salasEncontradas = salas.filter((sala) => {
            const numeroSala = String(sala.numero);
            const numeroBusca = String(numeroPesquisado);

            return (
                numeroSala === numeroBusca ||
                Number(numeroSala) === Number(numeroBusca)
            );
        });

        res.render("listarSalas", {
            salas: salasEncontradas,
            pesquisa: numeroPesquisado
        });

    } catch (erro) {
        console.log("ERRO AO PESQUISAR SALA:", erro);
        res.status(500).send("Erro ao pesquisar sala.");
    }
});

// ================= CADASTRAR SALA =====================

app.get("/salas/cadastrar", somenteAdmin, (req, res) => {
    res.render("cadastrarSala");
});

app.post("/salas/cadastrar", somenteAdmin, async (req, res) => {
    try {
        await Sala.create({
            numero: req.body.numero,
            bloco: req.body.bloco,
            andar: req.body.andar,
            turma: req.body.turma,
            turno: req.body.turno,
            horario: req.body.horario,
            capacidade: req.body.capacidade,
            responsavel: req.body.responsavel,
            status: req.body.status,
            observacoes: req.body.observacoes
        });

        res.redirect("/salas");

    } catch (erro) {
        console.log("ERRO AO CADASTRAR SALA:", erro);
        res.send("Erro ao cadastrar sala.");
    }
});

// ================= EDITAR SALA ========================

app.get("/salas/editar/:id", somenteAdmin, async (req, res) => {
    try {
        const sala = await Sala.findByPk(req.params.id, {
            raw: true
        });

        if (!sala) {
            return res.send("Sala não encontrada.");
        }

        res.render("editarSala", {
            sala: sala
        });

    } catch (erro) {
        console.log("ERRO AO ABRIR EDIÇÃO DA SALA:", erro);
        res.send("Erro ao abrir edição da sala.");
    }
});

app.post("/salas/editar", somenteAdmin, async (req, res) => {
    try {
        await Sala.update(
            {
                numero: req.body.numero,
                bloco: req.body.bloco,
                andar: req.body.andar,
                turma: req.body.turma,
                turno: req.body.turno,
                horario: req.body.horario,
                capacidade: req.body.capacidade,
                responsavel: req.body.responsavel,
                status: req.body.status,
                observacoes: req.body.observacoes
            },
            {
                where: {
                    id: req.body.id
                }
            }
        );

        res.redirect("/salas");

    } catch (erro) {
        console.log("ERRO AO EDITAR SALA:", erro);
        res.send("Erro ao editar sala.");
    }
});

// ============== ATUALIZAR STATUS DA SALA ==============
// SOMENTE ADMINISTRADOR

app.post("/salas/status/:id", somenteAdmin, async (req, res) => {
    try {
        const sala = await Sala.findByPk(req.params.id);

        if (!sala) {
            return res.send("Sala não encontrada.");
        }

        const statusPermitidos = [
            "Disponível",
            "Em uso",
            "Manutenção",
            "Indisponível"
        ];

        if (!statusPermitidos.includes(req.body.status)) {
            return res.status(400).send("Status inválido.");
        }

        await sala.update({
            status: req.body.status
        });

        res.redirect("/salas");

    } catch (erro) {
        console.log("ERRO AO ATUALIZAR STATUS:", erro);
        res.send("Erro ao atualizar o status da sala.");
    }
});

// ================= EXCLUIR SALA =======================

app.post("/salas/excluir/:id", somenteAdmin, async (req, res) => {
    try {
        await Sala.destroy({
            where: {
                id: req.params.id
            }
        });

        res.redirect("/salas");

    } catch (erro) {
        console.log("ERRO AO EXCLUIR SALA:", erro);
        res.send("Erro ao excluir sala.");
    }
});

// ======================================================
// ================= DEFEITOS ===========================
// ======================================================

// ================= NOTIFICAÇÕES =======================

app.get("/notificacoes", verificarLogin, async (req, res) => {
    try {
        const defeitos = await Defeito.findAll({
            raw: true
        });

        res.render("notificacoes", {
            defeitos: defeitos,
            usuario: req.session.usuario
        });

    } catch (erro) {
        console.log("ERRO AO CARREGAR NOTIFICAÇÕES:", erro);
        res.send("Erro ao carregar notificações.");
    }
});

// ================= LISTAR DEFEITOS ====================

app.get("/defeitos", somenteAdmin, async (req, res) => {
    try {
        const defeitos = await Defeito.findAll({
            raw: true
        });

        res.render("listarDefeitos", {
            defeitos: defeitos
        });

    } catch (erro) {
        console.log("ERRO AO LISTAR DEFEITOS:", erro);
        res.send("Erro ao listar defeitos.");
    }
});

// ================= CADASTRAR DEFEITO ==================

app.get("/defeitos/cadastrar", somenteAluno, (req, res) => {
    res.render("cadastrarDefeito");
});

app.post("/defeitos/cadastrar", somenteAluno, async (req, res) => {
    try {
        await Defeito.create({
            sala: req.body.sala,
            tipo: req.body.tipo,
            descricao: req.body.descricao,
            status: req.body.status,
            responsavel: req.session.usuario.nome
        });

        res.redirect("/notificacoes");

    } catch (erro) {
        console.log("ERRO AO CADASTRAR DEFEITO:", erro);
        res.send("Erro ao cadastrar defeito.");
    }
});

// ================= EDITAR DEFEITO =====================

app.get("/defeitos/editar/:id", somenteAdmin, async (req, res) => {
    try {
        const defeito = await Defeito.findByPk(req.params.id, {
            raw: true
        });

        if (!defeito) {
            return res.send("Defeito não encontrado.");
        }

        res.render("editarDefeito", {
            defeito: defeito
        });

    } catch (erro) {
        console.log("ERRO AO ABRIR EDIÇÃO DO DEFEITO:", erro);
        res.send("Erro ao abrir edição do defeito.");
    }
});


// ================= CADASTRAR DEFEITO PELO ADMINISTRADOR =================

app.get("/defeitos/cadastrar-admin", somenteAdmin, (req, res) => {
    res.render("cadastrarDefeitoAdmin");
});

app.post("/defeitos/cadastrar-admin", somenteAdmin, async (req, res) => {
    try {
        await Defeito.create({
            sala: req.body.sala,
            tipo: req.body.tipo,
            descricao: req.body.descricao,
            status: req.body.status,
            responsavel: req.session.usuario.nome
        });

        res.redirect("/defeitos");

    } catch (erro) {
        console.log("ERRO AO CADASTRAR EQUIPAMENTO PELO ADMIN:", erro);
        res.send("Erro ao cadastrar equipamento com defeito.");
    }
});

// ================= SALVAR EDIÇÃO DO DEFEITO ===========

app.post("/defeitos/editar", somenteAdmin, async (req, res) => {
    try {
        await Defeito.update(
            {
                sala: req.body.sala,
                tipo: req.body.tipo,
                descricao: req.body.descricao,
                status: req.body.status
            },
            {
                where: {
                    id: req.body.id
                }
            }
        );

        res.redirect("/defeitos");

    } catch (erro) {
        console.log("ERRO AO EDITAR DEFEITO:", erro);
        res.send("Erro ao editar defeito.");
    }
});

// ================= EXCLUIR DEFEITO ====================

app.post("/defeitos/excluir/:id", somenteAdmin, async (req, res) => {
    try {
        await Defeito.destroy({
            where: {
                id: req.params.id
            }
        });

        res.redirect("/defeitos");

    } catch (erro) {
        console.log("ERRO AO EXCLUIR DEFEITO:", erro);
        res.send("Erro ao excluir defeito.");
    }
});

// ================= SERVIDOR ===========================

const servidor = app.listen(3000, () => {
    console.log("SERVIDOR RODANDO EM http://localhost:3000");
});

servidor.on("error", (erro) => {
    console.log("ERRO AO INICIAR O SERVIDOR:", erro);
});
