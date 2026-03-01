const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: "imagens/receitas",
  filename: (req, file, cb) => {
    const nome = Date.now() + "-" + file.originalname;
    cb(null, nome);
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("imagem"), (req, res) => {
  res.json({
    sucesso: true,
    caminho: `imagens/receitas/${req.file.filename}`
  });
});

app.listen(3000, () =>
  console.log("🚀 Upload rodando em http://localhost:3000")
);
