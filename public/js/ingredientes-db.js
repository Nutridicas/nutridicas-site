//Arquiuvo criado com objetivo de somar quantidade de ingredientes
// na lista de compras na página receita.html
// Criada 13/03/2026 8h38m

window.ingredientesDB = {

  // =========================
  // FRUTAS
  // =========================
  banana: { unidade: "unidade", categoria: "Frutas" },
  maçã: { unidade: "unidade", categoria: "Frutas" },
  pera: { unidade: "unidade", categoria: "Frutas" },
  abacate: { unidade: "unidade", categoria: "Frutas" },
  morango: { unidade: "g", categoria: "Frutas" },
  manga: { unidade: "unidade", categoria: "Frutas" },
  mamão: { unidade: "unidade", categoria: "Frutas" },
  kiwi: { unidade: "unidade", categoria: "Frutas" },
  abacaxi: { unidade: "unidade", categoria: "Frutas" },
  laranja: { unidade: "unidade", categoria: "Frutas" },
  limão: {unidade: "unidade", categoria: "Frutas" },
  tangerina: { unidade: "unidade", categoria: "Frutas" },
  uva: { unidade: "g", categoria: "Frutas" },
  ameixa: { unidade: "unidade", categoria: "Frutas" },
  figo: { unidade: "unidade", categoria: "Frutas" },

  // =========================
  // VERDURAS
  // =========================
  alface: { unidade: "maço", categoria: "Verduras" },
  rúcula: { unidade: "maço", categoria: "Verduras" },
  agrião: { unidade: "maço", categoria: "Verduras" },
  espinafre: { unidade: "maço", categoria: "Verduras" },
  couve: { unidade: "maço", categoria: "Verduras" },
  chicória: { unidade: "maço", categoria: "Verduras" },

  // =========================
  // LEGUMES
  // =========================
  tomate: { unidade: "unidade", categoria: "Legumes" },
  cebola: { unidade: "unidade", categoria: "Legumes" },
  alho: { unidade: "dente", categoria: "Legumes" },
  cenoura: { unidade: "unidade", categoria: "Legumes" },
  batata: { unidade: "unidade", categoria: "Legumes" },
  "atata doce": { unidade: "unidade", categoria: "Legumes" },
  abobrinha: { unidade: "unidade", categoria: "Legumes" },
  berinjela: { unidade: "unidade", categoria: "Legumes" },
  pepino: { unidade: "unidade", categoria: "Legumes" },
  pimentão: { unidade: "unidade", categoria: "Legumes" },
  chuchu: { unidade: "unidade", categoria: "Legumes" },
  beterraba: { unidade: "unidade", categoria: "Legumes" },
  mandioquinha: { unidade: "unidade", categoria: "Legumes" },

  // =========================
  // CEREAIS E FARINHAS
  // =========================
  "farinha de aveia": { unidade: "xícara", categoria: "Cereais e farinhas" },
  "farinha de amêndoas": { unidade: "xícara", categoria: "Cereais e farinhas" },
  "farinha de coco": { unidade: "xícara", categoria: "Cereais e farinhas" },
  "farinha de arroz": { unidade: "xícara", categoria: "Cereais e farinhas" },
  "farinha integral": { unidade: "xícara", categoria: "Cereais e farinhas" },
  aveia: { unidade: "xícara", categoria: "Cereais e farinhas" },
  quinoa: { unidade: "xícara", categoria: "Cereais e farinhas" },
  amaranto: { unidade: "xícara", categoria: "Cereais e farinhas" },
  arroz: { unidade: "xícara", categoria: "Cereais e farinhas" },
  "arroz integral": { unidade: "xícara", categoria: "Cereais e farinhas" },

  // =========================
  // OLEAGINOSAS
  // =========================
  amêndoas: { unidade: "g", categoria: "Castanhas" },
  castanha: { unidade: "g", categoria: "Castanhas" },
  "castanha-do-pará": { unidade: "g", categoria: "Castanhas" },
  "castanha de caju": { unidade: "g", categoria: "Castanhas" },
  nozes: { unidade: "g", categoria: "Castanhas" },
  pistache: { unidade: "g", categoria: "Castanhas" },

  // =========================
  // SEMENTES
  // =========================
  chia: { unidade: "colher", categoria: "Sementes" },
  linhaça: { unidade: "colher", categoria: "Sementes" },
  "linhaça dourada": { unidade: "colher", categoria: "Sementes" },
  "linhaça marrom": { unidade: "colher", categoria: "Sementes" },
  "semente de abóbora": { unidade: "colher", categoria: "Sementes" },
  "semente de girassol": { unidade: "colher", categoria: "Sementes" },
  gergelim: { unidade: "colher", categoria: "Sementes" },

  // =========================
  // LATICÍNIOS
  // =========================
  leite: { unidade: "ml", categoria: "Laticínios" },
  iogurte: { unidade: "ml", categoria: "Laticínios" },
  manteiga: { unidade: "colher", categoria: "Laticínios" },
  queijo: { unidade: "g", categoria: "Laticínios" },
  "queijo minas": { unidade: "g", categoria: "Laticínios" },
  "queijo parmesão": { unidade: "g", categoria: "Laticínios" },

  // =========================
  // BEBIDAS VEGETAIS
  // =========================
  "leite vegetal": { unidade: "ml", categoria: "Bebidas vegetais" },
  "leite de coco": { unidade: "ml", categoria: "Bebidas vegetais" },
  "leite de amêndoas": { unidade: "ml", categoria: "Bebidas vegetais" },
  "leite de aveia": { unidade: "ml", categoria: "Bebidas vegetais" },

  // =========================
  // ÓLEOS
  // =========================
  azeite: { unidade: "colher", categoria: "Óleos" },
  "óleo de coco": { unidade: "colher", categoria: "Óleos" },
  "óleo de girassol": { unidade: "colher", categoria: "Óleos" },

  // =========================
  // TEMPEROS
  // =========================
  sal: { unidade: "colher", categoria: "Temperos" },
  pimenta: { unidade: "colher", categoria: "Temperos" },
  orégano: { unidade: "colher", categoria: "Temperos" },
  manjericão: { unidade: "colher", categoria: "Temperos" },
  cúrcuma: { unidade: "colher", categoria: "Temperos" },
  páprica: { unidade: "colher", categoria: "Temperos" },
  canela: { unidade: "colher", categoria: "Temperos" },
  "noz-moscada": { unidade: "colher", categoria: "Temperos" },

  // =========================
  // DOCES NATURAIS
  // =========================
  mel: { unidade: "colher", categoria: "Doces naturais" },
  "melado de cana": { unidade: "colher", categoria: "Doces naturais" },
  "açúcar mascavo": { unidade: "colher", categoria: "Doces naturais" },
  "açúcar de coco": { unidade: "colher", categoria: "Doces naturais" },
  adoçante: { unidade: "colher", categoria: "Doces naturais" },

  // =========================
  // OVOS
  // =========================
  ovo: { unidade: "unidade", categoria: "Ovos" },
  ovos: { unidade: "unidade", categoria: "Ovos" }

};