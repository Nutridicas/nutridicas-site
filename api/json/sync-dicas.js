// scirpt para copiar o id de dicas para dicas rapidas e o slug dele para dicas
// criado 14/04/2026

const fs = require('fs');

const dicasRapidasPath = 'dicas-rapidas.json';
const dicasPath = 'dicas.json';

const dicasRapidas = JSON.parse(fs.readFileSync(dicasRapidasPath));
const dicas = JSON.parse(fs.readFileSync(dicasPath));

// 🔤 normalizar texto
  function normalizar(texto) {
  if (!texto) return ""; // 🔥 evita erro

  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// 🔗 gerar slug automático
function gerarSlug(texto) {
  if (!texto) return "sem-slug";

  return normalizar(texto)
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

// 🔥 montar mapa de dicas completas
const mapa = [];

dicas.dicas.forEach(d => {
  mapa.push({
    id: d.id,
    slug: d.slug || gerarSlug(d.nome),
    nome: normalizar(d.nome),
    tags: (d.tags || []).map(t => normalizar(t))
  });
});

// 🔄 sincronizar dicas rápidas
dicasRapidas.dicas_rapidas.forEach(d => {

  if (!d.tipo) {
  console.log("⚠️ tipo indefinido:", d);
}

 const tipo = normalizar(d.tipo || "");

 let encontrada = mapa.find(m =>
  m.nome.includes(tipo) ||
  tipo.includes(m.nome) ||
  m.tags.some(tag => tag.includes(tipo) || tipo.includes(tag))
);

  if (encontrada) {
    d.id = encontrada.id;           // ✅ padroniza ID
    d.slug = encontrada.slug;       // ✅ padroniza slug
  } else {
    console.log(`⚠️ Não encontrou: ${d.tipo}`);

    if (!d.tipo) {
  console.log("⚠️ tipo indefinido:", d);
}

    // 🔥 fallback: gerar slug automático
    d.slug = gerarSlug(d.titulo || `${d.tema} ${d.tipo}`);
  }

});

// 💾 salvar arquivo atualizado
fs.writeFileSync(
  dicasRapidasPath,
  JSON.stringify(dicasRapidas, null, 2)
);

console.log("✅ IDs e slugs sincronizados e gerados!");

const naoEncontradas = [];

dicasRapidas.dicas_rapidas.forEach(d => {
  if (!mapa.find(m => m.id === d.id)) {
    naoEncontradas.push(d.tipo);
  }
});

console.log("🚨 Não mapeadas:", naoEncontradas);