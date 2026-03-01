const fs = require("fs");
const path = require("path");

const ARQUIVO = path.join(__dirname, "../api/json/receitas.json");

function erro(slug, msg) {
  return `❌ [${slug || "SEM SLUG"}] ${msg}`;
}

function aviso(slug, msg) {
  return `⚠️ [${slug}] ${msg}`;
}

function slugValido(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

const receitas = JSON.parse(fs.readFileSync(ARQUIVO, "utf-8"));

let bloqueado = false;

console.log("\n🔍 VALIDANDO receitas.json\n");

receitas.forEach((r, i) => {
  const slug = r.slug;

  if (!slug) {
    console.log(erro(null, `Receita #${i} sem slug`));
    bloqueado = true;
    return;
  }

  if (!slugValido(slug)) {
    console.log(erro(slug, "Slug inválido"));
    bloqueado = true;
  }

  if (!r.titulo) {
    console.log(erro(slug, "Sem título"));
    bloqueado = true;
  }

  if (!Array.isArray(r.versoes) || !r.versoes.length) {
    console.log(erro(slug, "Sem versões"));
    bloqueado = true;
    return;
  }

  const conteudo = r.versoes.at(-1).conteudo;

  if (!conteudo.ingredientes?.length)
    console.log(erro(slug, "Ingredientes vazios"));

  if (!conteudo.preparo?.length)
    console.log(erro(slug, "Modo de preparo vazio"));

  // 🟡 NOVOS AVISOS
  if (!conteudo.tempoPreparo) console.log(aviso(slug, "Sem tempo de preparo"));
  if (!conteudo.rendimento) console.log(aviso(slug, "Sem rendimento"));
  if (!conteudo.dificuldade) console.log(aviso(slug, "Sem dificuldade"));
  if (!conteudo.enviadaPor) console.log(aviso(slug, "Sem enviadaPor"));

  if (!conteudo.miseEnPlace?.length)
    console.log(aviso(slug, "Sem mise en place"));

  if (!conteudo.conservacao?.length)
    console.log(aviso(slug, "Sem conservação"));

});

if (bloqueado) {
  console.log("\n⛔ ERROS CRÍTICOS — CORRIJA ANTES DE PUBLICAR");
  process.exit(1);
}

console.log("\n✅ receitas.json VALIDADO COM SUCESSO");
