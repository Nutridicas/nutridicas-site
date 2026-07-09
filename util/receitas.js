// 1. FUNÇÃO NORMALIZAR: Agora ela é 100% segura e não quebra se receber null/undefined
function normalizar(texto) {
  if (!texto) return ""; // Se o parâmetro não existir, retorna string vazia de forma segura
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const params = new URLSearchParams(window.location.search);
const categoria = params.get("categoria");
const subcategoria = params.get("subcategoria");
const tag = params.get("tag");

const lista = document.getElementById("listaReceitas") || document.getElementById("lista");
const titulo = document.getElementById("tituloCategoria");
const contador = document.getElementById("contadorReceitas");

fetch("/receitas")
  .then(resp => {
    if (!resp.ok) throw new Error("Erro ao buscar receitas do servidor");
    return resp.json();
  })
  .then(receitas => {
    window.receitasDebug = receitas;

    // Se não houver filtros na URL, traz todas as receitas, senão filtra de forma segura
    const resultado = receitas.filter(r => {
      const tagL = tag ? tag.toLowerCase() : null;
      const cat = normalizar(categoria);
      const sub = normalizar(subcategoria);

      const rCat = normalizar(r.categoria);
      const rSub = normalizar(r.subcategoria);

      // Se o filtro da URL existir, ele deve bater com o banco. Se não existir, é considerado "OK"
      const catOk = !cat || rCat === cat;
      const subOk = !sub || rSub === sub;
      const tagOk = !tagL || (r.tags && r.tags.map(t => t.toLowerCase()).includes(tagL));

      return catOk && subOk && tagOk;
    });

    // Temtar pegar as versões da mesma receita - 05/06/2026 
    const resultadoExpandido = [];

const resultadoExpandido = [];

resultado.forEach(receita => {

  // adiciona a receita principal
  resultadoExpandido.push({
    ...receita,
    versaoAtual: null
  });

  // adiciona as versões
  if (Array.isArray(receita.versoes)) {

    receita.versoes.forEach(v => {

      resultadoExpandido.push({
        ...receita,
        titulo: `${receita.titulo} - ${v.nome}`,
        slug: receita.slug,
        versaoAtual: v
      });

    });

  }

});
    //
    // Executa as atualizações na tela protegendo contra funções ausentes
    if (typeof atualizarTitulo === "function") atualizarTitulo(resultado);
    if (typeof atualizarContador === "function") atualizarContador(resultado);
    
    // Chama a renderização dos cards corrigida
   renderizarCardsListagem(resultadoExpandido);
  })
  .catch(erro => {
    console.error("Erro no fluxo de receitas:", erro);
    if (lista) {
      lista.innerHTML = `<div class="sem-resultados"><p>Erro ao carregar a listagem de receitas.</p></div>`;
    }
  });

// 2. FUNÇÃO DE RENDERIZAÇÃO DOS CARDS BLINDADA
function renderizarCardsListagem(receitas) {
  if (!lista) return;
  lista.innerHTML = ""; // Limpa o container

  if (!receitas || receitas.length === 0) {
    lista.innerHTML = `
      <div class="sem-resultados">
        <span>🍳</span>
        <p>Nenhuma receita encontrada para esta categoria.</p>
      </div>`;
    return;
  }

  receitas.forEach(r => {
    // Tratamento rigoroso anti-undefined para as propriedades do card
    const nomeReceita = r.titulo || r.nome || "Receita sem nome";
    const resumoReceita = r.fraseCurta || r.descricao || "Clique em ver receita para conferir os detalhes e modo de preparo.";
    
    // ATENÇÃO: O link do card DEVE passar o slug correto para a página individual abrir depois
    const linkSlug = r.slug || ""; 

        console.log(linkSlug);
        console.log("O link slug primeiro");

    // Tratamento de imagem com fallback automático para o erro 404
    const temFoto = r.imagem && r.imagem.trim() !== "";
    const classeFoto = temFoto ? "card-foto" : "card-foto sem-foto";
    const srcImagem = temFoto ? r.imagem : "";

    const card = document.createElement("div");
    card.className = "card-receita-nova";
    card.innerHTML = `
      <div class="${classeFoto}">
        ${temFoto ? `<img src="imagens/receitas/${srcImagem}" alt="${nomeReceita}" onerror="this.parentElement.classList.add('sem-foto'); this.remove();">` : ''}
      </div>
      <div class="card-body">
        
        <h3>${nomeReceita}</h3>
        <p>${resumoReceita}</p>
        <a href="receita.html?slug=${linkSlug}" class="btn-ver">Ver Receita</a>
      </div>
    `;
     
    lista.appendChild(card);
    console.log(linkSlug);
        console.log("O link slug antes do link final");
  });
}

// função para exibir a quantidade de receitas encontradas de aordo com a escolha no menu 
// 03/06/2026
function atualizarContador(listaReceitas) {
    if (!contador) return;

    const total = listaReceitas.length;

    contador.textContent =
        total === 1
            ? "1 receita encontrada"
            : `${total} receitas encontradas`;
}