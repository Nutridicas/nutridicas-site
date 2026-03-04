// =======================================
// 🚀 SERVER NUTRICHEF API + FRONTEND
// atualizado 03/03/2026 - versão segura
// =======================================

require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

/* =======================================
   CONFIG BÁSICA
======================================= */

app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax"
  }
}));

/* =======================================
   PASTAS
======================================= */

const PUBLIC_FOLDER = path.join(__dirname, "../public");
const ADMIN_FOLDER = path.join(__dirname, "../admin");

/* =======================================
   🔓 ARQUIVOS PÚBLICOS
======================================= */

app.use(express.static(PUBLIC_FOLDER));

/* =======================================
   🔐 MIDDLEWARE DE AUTENTICAÇÃO
======================================= */

function authMiddleware(req, res, next) {
  if (!req.session.auth) {
    return res.redirect("/admin-login");
  }
  next();
}

/* =======================================
   🔐 ROTAS ADMIN (PROTEGIDAS)
======================================= */

// Login page
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(ADMIN_FOLDER, "login.html"));
});

// Servir css/js do admin (APENAS ISSO)
app.use("/admin/css", express.static(path.join(ADMIN_FOLDER, "css")));
app.use("/admin/js", express.static(path.join(ADMIN_FOLDER, "js")));

// Login seguro com bcrypt
app.post("/login", async (req, res) => {

  const senhaDigitada = req.body.senha;
  const hashSalvo = process.env.ADMIN_HASH;

  const senhaValida = await bcrypt.compare(senhaDigitada, hashSalvo);

  if (!senhaValida) {
    return res.status(401).send("Senha incorreta");
  }

  req.session.auth = true;
  res.redirect("/dashboard");
});

// Dashboard protegido
app.get("/dashboard", authMiddleware, (req, res) => {
  res.sendFile(path.join(ADMIN_FOLDER, "dashboard.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin-login");
  });
});

/* =======================================
   📂 UPLOAD IMAGENS
======================================= */

const pastaUploads = path.join(__dirname, "..", "public", "imagens", "receitas");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pastaUploads),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.post("/upload", authMiddleware, upload.single("imagem"), (req, res) => {

  if (!req.file) {
    return res.json({ ok: false });
  }

  res.json({
    ok: true,
    caminho: req.file.filename
  });
});

/* =======================================
   📂 JSON RECEITAS
======================================= */

const RECEITAS_FILE = path.join(__dirname, "json", "receitas.json");
let receitasCache = [];

function carregarReceitas() {
  receitasCache = JSON.parse(fs.readFileSync(RECEITAS_FILE, "utf-8"));
}
carregarReceitas();

/* =======================================
   🌐 API RECEITAS
======================================= */

app.get("/receitas", (req, res) => {

  const resumo = receitasCache.map(r => {
    const ultima = r.versoes.at(-1).conteudo;

    return {
      slug: r.slug,
      titulo: r.titulo,
      imagem: r.imagem,
      categoria: ultima.categoria,
      status: r.status,
      topSemana: r.topSemana || false,
      premium: r.premium || false,
      tempoPreparo: ultima.tempoPreparo,
      rendimento: ultima.rendimento,
      dificuldade: ultima.dificuldade,
      custoMedio: ultima.custoMedio,
      enviadaPor: ultima.enviadaPor || "Anônimo"
    };
  });

  res.json(resumo);
});

app.get("/receitas/:slug", (req, res) => {
  const receita = receitasCache.find(r => r.slug === req.params.slug);

  if (!receita)
    return res.status(404).json({ erro: "Não encontrada" });

  res.json(receita);
});

app.post("/receitas", authMiddleware, (req, res) => {

  const novaReceita = {
    id: uuidv4(),
    dataCriacao: new Date().toISOString(),
    ...req.body
  };

  receitasCache.push(novaReceita);

  fs.writeFileSync(
    RECEITAS_FILE,
    JSON.stringify(receitasCache, null, 2)
  );

  res.json({ ok: true });
});

/* =======================================
   🌐 ROTA PRINCIPAL
======================================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_FOLDER, "index.html"));
});

/* =======================================
   🚀 START SERVER (UMA ÚNICA VEZ)
======================================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});