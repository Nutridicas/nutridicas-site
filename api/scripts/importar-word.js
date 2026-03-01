const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const PASTA_WORD = "./word";
const PASTA_JSON = "./imports";

if (!fs.existsSync(PASTA_JSON)) {
  fs.mkdirSync(PASTA_JSON);
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

async function processarDoc(arquivo) {
  const { value } = await mammoth.extractRawText({
    path: path.join(PASTA_WORD, arquivo)
  });

  const titulo = bloco(value, "TÍTULO", "CATEGORIA");
  const categoria = bloco(value, "CATEGORIA", "SLUG");
  const slug = bloco(value, "SLUG", "TEMPO");

  // ✅ NOVOS CAMPOS
  const tempoPreparo = bloco(value, "TEMPO DE PREPARO", "RENDIMENTO");
  const rendimento = bloco(value, "RENDIMENTO", "DIFICULDADE");
  const dificuldade = bloco(value, "DIFICULDADE", "CUSTO");
  const custoMedio = bloco(value, "CUSTO MÉDIO", "ENVIADA");
  const enviadaPor = bloco(value, "ENVIADA POR", "MISE");

  const miseEnPlace = lista(bloco(value, "MISE EN PLACE", "CONSERVAÇÃO"));
  const conservacao = lista(bloco(value, "CONSERVAÇÃO", "INGREDIENTES"));

  const ingredientes = lista(bloco(value, "INGREDIENTES", "MODO"));
  const preparo = lista(bloco(value, "MODO DE PREPARO", "MEDIDAS"));
  const medidas = lista(bloco(value, "MEDIDAS", "NUTRICIONAL"));

  const nutriTxt = bloco(value, "NUTRICIONAL");
  const nutricional = {};

  nutriTxt.split("\n").forEach(l => {
    const [k, v] = l.split(":");
    if (k && v) nutricional[k.toLowerCase()] = v.trim();
  });

  const receita = {
    slug,
    titulo,
    status: "publicada",
    topSemana: false,
    imagem: "",
    premium: !!Object.keys(nutricional).length,
    tags: categoria ? [categoria] : [],

    versoes: [
      {
        data: new Date().toISOString().slice(0, 10),
        conteudo: {
          categoria,

          tempoPreparo,
          rendimento,
          dificuldade,
          custoMedio,
          enviadaPor,

          miseEnPlace,
          conservacao,

          ingredientes,
          preparo,
          medidas,

          nutricional,
          substituicoes: [],
          dicas: [],
          comentarioNutri: "",
          listaCompras: []
        }
      }
    ]
  };

  fs.writeFileSync(
    path.join(PASTA_JSON, `${slug}.json`),
    JSON.stringify(receita, null, 2)
  );

  console.log("✔ Importado:", slug);
}

(async () => {
  const arquivos = fs.readdirSync(PASTA_WORD).filter(f => f.endsWith(".docx"));
  for (const a of arquivos) {
    await processarDoc(a);
  }
})();
