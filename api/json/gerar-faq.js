// Arquivo para gerar json para requisições de faq por ia offline

const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const perguntasGlobais = new Set();

async function gerarFAQComIA(dica) {
  const textoBase = `
TEMA: ${dica.tema}

CATEGORIA: ${dica.categoria}

PREPARO:
${(dica.conteudo?.preparo || []).join("\n")}

DICAS EXTRAS:
${(dica.conteudo?.dicas_extras || []).join("\n")}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `Gere FAQ em JSON:\n${textoBase}`
  });

  const texto = response.output[0].content[0].text;

  try {
    const faq = JSON.parse(texto);

    return faq.filter(item => {
      if (perguntasGlobais.has(item.pergunta)) return false;
      perguntasGlobais.add(item.pergunta);
      return true;
    });

  } catch {
    return [];
  }
}