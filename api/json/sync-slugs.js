const fs = require('fs');

// 📂 caminhos dos arquivos (ajuste se necessário)
const dicasRapidasPath = './public/dicas-rapidas.json';
const dicasPath = './public/dicas.json';

// 📥 ler arquivos
const dicasRapidas = JSON.parse(fs.readFileSync(dicasRapidasPath));
const dicas = JSON.parse(fs.readFileSync(dicasPath));

// 🧠 criar mapa ID → SLUG
const mapa = {};

dicas.dicas.forEach(d => {
  mapa[d.id] = d.slug;
});

// 🔄 atualizar dicas rápidas
dicasRapidas.dicas_rapidas.forEach(d => {
  if (mapa[d.id]) {
    d.slug = mapa[d.id];
  }
});

// 💾 salvar arquivo atualizado
fs.writeFileSync(
  dicasRapidasPath,
  JSON.stringify(dicasRapidas, null, 2)
);

console.log("✅ Slugs sincronizados com sucesso!");