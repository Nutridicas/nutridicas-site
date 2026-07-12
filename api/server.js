// =======================================
// 🚀 SERVER NutriDicas API + FRONTEND
// atualizado 03/03/2026 - versão segura
// =======================================

require("dotenv").config({ path: __dirname + "/.env" });
//console.log("HASH:", process.env.ADMIN_HASH);

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

// ============================
// Middleware de proteção do admin - Inserida 05/03/2026 11h43m
// ============================
function verificarAuth(req, res, next) {

  if (!req.session || !req.session.auth) {
    return res.redirect("/admin-login");
  }

  next();
}

/* =======================================
   PASTAS
======================================= */

const PUBLIC_FOLDER = path.join(__dirname, "../public");
const ADMIN_FOLDER = path.join(__dirname, "../admin");

// tentativa de melhorar a busca no edge e chrome 04/03/2026
//const fs = require("fs");
//const path = require("path");

app.get("/receitas", (req, res) => {
  const filePath = path.join(__dirname, "json", "receitas.json");

fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler receitas:", err);
      return res.status(500).json({ erro: "Erro ao carregar receitas" });
    }

    try {
      const receitas = JSON.parse(data);
      res.json(receitas);
    } catch (parseError) {
      console.error("Erro ao converter JSON:", parseError);
      res.status(500).json({ erro: "JSON inválido" });
    }
  });
});

// ler arquivo medidas.json - medidas caseiras - inserida 24/03/2026 00h57m
app.get("/medidas", (req, res) => {
  const dados = require("./json/medidas.json");
  res.json(dados);
});

// ler arquivo receitas-index.json - busca de receitas inserida 24/03/2026 
app.get("/receitas-index", (req, res) => {
  const rdados = require("./json/receitas-index.json");
  res.json(rdados);
});

// ler arquivo ingredientes-info.json - busca informações para tooltip 
// - inserida 30/03/2026 
app.get("/ingredientes-info", (req, res) => {
  const idados = require("./json/ingredientes-info.json");
  res.json(idados);
});

// ler arquivo receitas-historia.json 
// - inserida 02/04/2026 
app.get("/receitas-historia", (req, res) => {
  const hdados = require("./json/receitas-historia.json");
  res.json(hdados);
});

// ler arquivo ingredientes-geral.json - busca informações para tooltip 
// - inserida 04/04/2026 
app.get("/ingredientes-geral", (req, res) => {
  const gdados = require("./json/ingredientes-geral.json");
  res.json(gdados);
});

// ler arquivo dicas.json - dicas detlhadas para dicas.html 
// - inserida 13/04/2026 
app.get("/dicas", (req, res) => {
  const ddados = require("./json/dicas.json");
  res.json(ddados);
});

/// ler arquivo dicas-rápidas.json - dicas rápidas no index.html 
// - inserida 13/04/2026 
app.get("/dicas-rapidas", (req, res) => {
  const xdados = require("./json/dicas-rapidas.json");
  res.json(xdados);
});

// ler arquivo frutas.json - informações sobre frutas, no frutas.html 
// - inserida 19/05/2026 
app.get("/frutas", (req, res) => {
  const fdados = require("./json/frutas.json");
  res.json(fdados);
});

// ler arquivo legumes.json - informações sobre legumes no legumes.html 
// - inserida 19/05/2026 
app.get("/legumes", (req, res) => {
  const ldados = require("./json/legumes.json");
  res.json(ldados);
});

// ler arquivo nutridicas.json - dicas de nutrição - nutridicas.html 
// - inserida 25/05/2026 
app.get("/nutridicas", (req, res) => {
  const ndados = require("./json/nutridicas.json");
  res.json(ndados);
});

// ler arquivo termos-culinarios.json - termos gastronômicos - termos.html 
// - inserida 10/06/2026 
app.get("/termos-culinarios", (req, res) => {
  const tdados = require("./json/termos-culinarios.json");
  res.json(tdados);
});

// ler arquivo substituicoes.json - substituições de ingredientes
// - inserida 10/06/2026 
app.get("/substituicoes", (req, res) => {
  const sdados = require("./json/substituicoes.json");
  res.json(sdados);
});

// ler arquivo utensilios.json - utensilios de cozinha
// - inserida 12/07/2026 
app.get("/utensilios", (req, res) => {
  const udados = require("./json/utensilios.json");
  res.json(udados);
});

// Tentativa de adcionar novas dicas - inserida 13/04/2026
app.use(express.json());

app.post("/nova-dica-rapida", (req, res) => {
  const novaDica = req.body;

  const filePath = "./json/dicas-rapidas.json";
  const data = JSON.parse(fs.readFileSync(filePath));

  data.dicas_rapidas.push(novaDica);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.json({ sucesso: true });
});

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

// alteração corrigir erro de acesso ao dashboard 05/03/026

// dashboard protegido
app.get("/dashboard", verificarAuth, (req, res) => {
  res.sendFile(path.join(ADMIN_FOLDER, "dashboard.html"));
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

  res.json({ success: true });

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