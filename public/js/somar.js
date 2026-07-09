// Arquivo criado para guardar funções de somas de ingredientes
// Criado em 13/03/2026

// ===============================
// INTERPRETAR INGREDIENTE - alterada 17/05/2026
// ===============================
  function interpretarIngrediente(texto) {
  if (!texto) return null;

  const infoQtd = extrairQuantidade(texto);
  const ingrediente = detectarIngrediente(texto);

  return {

    // MODIFICAÇÃO: Mantém o texto original para não perder termos como "leite integral" ou "manteiga sem sal"
    nome: texto.trim(), 
    quantidade: infoQtd.quantidade,
    unidade: infoQtd.unidade || ingrediente.unidade,
    categoria: ingrediente.categoria
  };
}


// ===============================================================
// SOMAR INGREDIENTES (CORRIGIDA 17/05/2026 - ANTI-DUPLICAÇÃO)
// ===============================================================
// ===============================================================
// SOMAR INGREDIENTES (SEM ERROS DE SINTAXE - ANTI-DUPLICAÇÃO)
// ===============================================================
function somarIngredientes(lista) {
  const mapa = {};

  lista.forEach(item => {
    if (!item || !item.nome) return;

    // Remove espaços nas pontas e ignora maiúsculas/minúsculas para unificar itens idênticos
    const chave = item.nome.trim().toLowerCase();

    if (!mapa[chave]) {
      mapa[chave] = {
        nome: item.nome, 
        quantidade: parseFloat(item.quantidade) || 1,
        unidade: item.unidade || "",
        categoria: item.categoria || "Outros",
        receitaOrigem: item.receitaOrigem || ""
      };
    } else {
      // Se o item já existe na lista, soma APENAS o número, sem duplicar o texto
      mapa[chave].quantidade += parseFloat(item.quantidade) || 1;
      
      // Sincroniza o nome da receita se vier de outra origem
      if (item.receitaOrigem && mapa[chave].receitaOrigem && !mapa[chave].receitaOrigem.includes(item.receitaOrigem)) {
        mapa[chave].receitaOrigem += `, ${item.receitaOrigem}`;
      }
    }
  });

  return Object.values(mapa);
}
window.somarIngredientes = somarIngredientes;

// ===============================
// ORGANIZAR POR CATEGORIA
// ===============================
function organizarCategorias(lista){

  const categorias = {};

  lista.forEach(item => {

    const cat = item.categoria || "Outros";

    if(!categorias[cat]){
      categorias[cat] = [];
    }

    categorias[cat].push(item);

  });

  return categorias;

}


// ===============================
// PLURAL INTELIGENTE
// ===============================
function pluralizar(palavra, quantidade){

  if(quantidade <= 1) return palavra;

  if(palavra.endsWith("r")) return palavra + "es";

  if(palavra.endsWith("ão")) return palavra.replace("ão","ões");

  if(palavra.endsWith("s")) return palavra;

  return palavra + "s";

}

// Detectar ingredientes

// ===============================================================
// DETECTAR INGREDIENTE Atualizada 17/05/2026
// ===============================================================
function detectarIngrediente(texto) {
  const textoLimpo = limparTexto(texto);

  // Verifica se o banco de dados de ingredientes existe
  const base = window.ingredientesDB || typeof ingredientesDB !== "undefined" ? ingredientesDB : null;

  if (base) {
    for (let chave in base) {
      if (textoLimpo.includes(chave)) {
        return {
          nome: chave,
          unidade: base[chave].unidade,
          categoria: base[chave].categoria
        };
      }
    }
  }

  // Se não encontrar no banco, retorna o texto limpo como padrão
  return {
    nome: texto,
    unidade: "",
    categoria: "Outros"
  };
}


//=============
// Alterada 12/04/2026 02h21m madrugada

function extrairQuantidade(texto) {
  const match = texto.match(/(\d+(?:\/\d+)?)\s?(g|kg|ml|l|xícara|colher|unidade)?/i);

  if (!match) {
    return { quantidade: 1, unidade: "" };
  }

  let quantidade = match[1];

  // Converte fração tipo 1/2
  if (quantidade.includes("/")) {
    const [num, den] = quantidade.split("/");
    quantidade = parseFloat(num) / parseFloat(den);
  } else {
    quantidade = parseFloat(quantidade);
  }

  return {
    quantidade,
    unidade: match[2] || ""
  };
}

//
function identificarIngrediente(texto) {
  const base = window.ingredientesDB;

  if (!base) {
    console.error("ingredientesDB não carregado");
    return { nome: texto, categoria: "Outros" };
  }

  const chave = Object.keys(base)
  .sort((a, b) => b.length - a.length)
  .find(k => texto.includes(k));

  if (chave) {
    return {
      nome: chave,
      categoria: base[chave].categoria,
      unidade: base[chave].unidade
    };
  }

  return {
    nome: texto,
    categoria: "Outros",
    unidade: "unidade"
  };
}

//============ Alterada 17/05/2026

function limparTexto(texto) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .replace(/\s+/g, " ")
    // Removemos o .replace("de ","") antigo para não quebrar as medidas!
    .replace("madura", "")
    .replace("maduro", "")
    .replace("picado", "")
    .replace("picada", "")
    .replace("ralado", "")
    .replace("ralada", "")
    .trim();
}
