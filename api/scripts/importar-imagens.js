const fs = require("fs");
const path = require("path");

const receitas = require("../api/json/receitas.json");

const ORIGEM = path.join(__dirname, "../import/imagens");
const DESTINO = path.join(__dirname, "../public/imagens/receitas");

if (!fs.existsSync(DESTINO)) fs.mkdirSync(DESTINO, { recursive: true });

let alterado = false;

receitas.forEach(r => {
  const arquivo = `${r.slug}.jpg`;
  const origem = path.join(ORIGEM, arquivo);
  const destino = path.join(DESTINO, arquivo);

  if (fs.existsSync(origem)) {
    fs.copyFileSync(origem, destino);

    if (!r.imagem || !r.imagem.includes(arquivo)) {
      r.imagem = `/imagens/receitas/${arquivo}`;
      alterado = true;
      console.log(`🖼️ Imagem vinculada: ${r.slug}`);
    }
  }
});

if (alterado) {
  fs.writeFileSync(
    path.join(__dirname, "../api/json/receitas.json"),
    JSON.stringify(receitas, null, 2)
  );
  console.log("\n✅ receitas.json atualizado com imagens");
}
