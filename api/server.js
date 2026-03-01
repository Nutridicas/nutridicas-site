// =======================================
// 🚀 SERVER NUTRICHEF API + FRONTEND
// atualizado em 19/02/26 ✅ 00:24
// =======================================

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


/* =======================================
   ✅ SERVIR ARQUIVOS HTML DA PASTA PUBLIC
======================================= */

const PUBLIC_FOLDER = path.join(__dirname, "../public");
const ADMIN_FOLDER = path.join(__dirname, "../admin");

app.use(express.static(PUBLIC_FOLDER));
app.use("/admin", express.static(ADMIN_FOLDER));

/* =======================================
   ✅ UPLOAD DE IMAGENS
======================================= */

//const multer = require("multer");


// sobe um nível da pasta api
const pastaUploads = path.join(__dirname, "..", "public", "imagens", "receitas");

// cria a pasta automaticamente se não existir
if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUploads);
  },
  filename: (req, file, cb) => {
    const nome = Date.now() + "-" + file.originalname;
    cb(null, nome);
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("imagem"), (req, res) => {

  if (!req.file) {
    return res.json({ ok: false });
  }

  res.json({
    ok: true,
    caminho: req.file.filename
  });

});


//===========================

/* =======================================
   ✅ JSON FILE
======================================= */

const RECEITAS_FILE = path.join(__dirname, "json", "receitas.json");
let receitasCache = [];

/* LOAD */
function carregarReceitas() {
  receitasCache = JSON.parse(fs.readFileSync(RECEITAS_FILE, "utf-8"));
}
carregarReceitas();

/* =======================================
   ✅ ROTAS DA API
======================================= */

/* GET LISTA */
app.get("/receitas", (req, res) => {

  const resumo = receitasCache.map(r => {

    const ultima = r.versoes.at(-1).conteudo;

    return {
      slug: r.slug,
      titulo: r.titulo,

      // ✅ imagem vem do JSON
      imagem: r.imagem,

      // ✅ categoria vem da última versão
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


/* GET RECEITA */
app.get("/receitas/:slug", (req, res) => {
  const receita = receitasCache.find(r => r.slug === req.params.slug);

  if (!receita)
    return res.status(404).json({ erro: "Não encontrada" });

  res.json(receita);
});

/* POST RECEITA - Atualização */

app.post("/receitas", (req, res) => {

  const novaReceita = {
    id: uuidv4(),                       // ✅ gera UUID automático
    dataCriacao: new Date().toISOString(), // opcional mas profissional
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
   ✅ ROTA PRINCIPAL (index.html)
======================================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_FOLDER, "index.html"));
});


/* =======================================
   🚀 START SERVER - Atualizado para subir em  01/03/2026
======================================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
