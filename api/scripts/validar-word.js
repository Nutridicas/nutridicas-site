const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const PASTA_WORD = "./word";

function erro(msg) {
  return { tipo: "ERRO", msg };
}

function aviso(msg) {
  return { tipo: "AVISO", msg };
}

function bloco(texto, ini, fim) {
  const r = new RegExp(`${ini}:([\\s\\S]*?)${fim || "$"}`, "i");
  const m = texto.match(r);
  return m ? m[1].trim() : "";
}

function lista(txt) {
  return txt
    .split("\n")
    .map(l => l.replace(/^[-•\d.]+/, "").trim())
    .filter(Boolean);
}

function slugValido(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

async function validarArquivo(arquivo) {
  const { value } = await mammoth.extractRawText({
    path: path.join(PASTA_WORD, arquivo)
  });

  const erros = [];
  const avisos = [];

  const titulo = bloco(value, "TÍTULO", "CATEGORIA");
  const slug = bloco(value, "SLUG", "TEMPO");

  const tempo = bloco(value, "TEMPO DE PREPARO", "RENDIMENTO");
  const rendimento = bloco(value, "RENDIMENTO", "DIFICULDADE");
  const dificuldade = bloco(value, "DIFICULDADE", "CUSTO MÉDIO");

  const ingredientes = lista(bloco(value, "INGREDIENTES", "MODO"));
  const preparo = lista(bloco(value, "MODO DE PREPARO", "MEDIDAS"));

  if (!titulo) erros.push(erro("Falta TÍTULO"));
  if (!slug) erros.push(erro("Falta SLUG"));
  if (slug && !slugValido(slug))
    erros.push(erro("SLUG inválido"));

  if (!ingredientes.length) erros.push(erro("Ingredientes vazios"));
  if (!preparo.length) erros.push(erro("Modo de preparo vazio"));

  // 🟡 NOVOS AVISOS
  if (!tempo) avisos.push(aviso("Sem tempo de preparo"));
  if (!rendimento) avisos.push(aviso("Sem rendimento"));
  if (!dificuldade) avisos.push(aviso("Sem dificuldade"));

  return { erros, avisos };
}

(async () => {
  const arquivos = fs.readdirSync(PASTA_WORD).filter(f => f.endsWith(".docx"));

  console.log("\n🔍 VALIDANDO RECEITAS WORD\n");

  let bloqueado = false;

  for (const a of arquivos) {
    const { erros, avisos } = await validarArquivo(a);

    if (!erros.length && !avisos.length) {
      console.log(`✅ ${a} — OK`);
      continue;
    }

    console.log(`\n📄 ${a}`);

    erros.forEach(e => {
      console.log(`❌ ERRO: ${e.msg}`);
      bloqueado = true;
    });

    avisos.forEach(v => {
      console.log(`⚠️ AVISO: ${v.msg}`);
    });
  }

  if (bloqueado) {
    console.log("\n⛔ IMPORTAÇÃO BLOQUEADA — corrija os erros acima");
    process.exit(1);
  }

  console.log("\n🎉 Todos os arquivos estão válidos!");
})();
