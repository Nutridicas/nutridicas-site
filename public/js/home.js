// FUNÇÃO PARA CHAMAR RECEITAS EM DESTAQUE - CRIADA 12/04/2026
// em index.html - alterada em 27/05/2026



document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("homeReceitas");
  if (!container) return;

  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  fetch("/receitas")
    .then(res => res.json())
    .then(receitas => {

      // Apenas publicadas
      const publicadas = receitas.filter(r => r.status === "publicada");

      // Embaralhar receitas
      const receitasMixadas = publicadas.sort(() => 0.5 - Math.random());

      // Mostrar apenas 4
      const destaque = receitasMixadas.slice(0, 4);

      criarSecao(destaque);

      carregarNovidades();

    });

  // ============================
  // Criar seção destaque
  // ============================
  function criarSecao(lista) {

    const bloco = document.createElement("div");

    bloco.innerHTML = `
      <div class="receitas-grid"></div>
    `;

    const grid = bloco.querySelector(".receitas-grid");

       lista.forEach(r => {

      const img = r.imagem
        ? `/imagens/receitas/${r.imagem}`
        : `/imagens/placeholder.jpg`;

      const tags = gerarTags(r);
      const isFav = favoritos.includes(r.slug);

      const card = document.createElement("article");
      card.className = "card-receita";

      card.innerHTML = `
        <a href="receita.html?slug=${r.slug}" class="card-link">

          <img
            src="${img}"
            alt="${r.titulo}"
            class="card-img"
          >

          <div class="card-content">

            <div class="tags">
              ${tags.map(t => `<span>${t}</span>`).join("")}
            </div>

            <h3>${r.titulo}</h3>

          </div>

        </a>

        <button
          type="button"
          class="fav-btn ${isFav ? "active" : ""}"
          data-slug="${r.slug}">
          ${isFav ? "❤️" : "🤍"}
        </button>
      `;

      grid.appendChild(card);
    });

    container.appendChild(bloco);
  }

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".fav-btn");

      // Se não clicou no favorito, deixa o link do card agir naturalmente
      if (!btn) return;

      // Se clicou no favorito, barra o link e processa a função
      e.preventDefault();
      e.stopPropagation();

      toggleFavorito(btn.dataset.slug);
    });

  // ============================
  // Tags automáticas
  // ============================
  function gerarTags(r) {

    const titulo = r.titulo.toLowerCase();
    const tags = [];

    if (titulo.includes("zero lactose")) tags.push("🥛 Zero Lactose");
    if (titulo.includes("sem açúcar") || titulo.includes("zero açúcar"))
      tags.push("🍬 Sem Açúcar");

    if (titulo.includes("vegana")) tags.push("🥦 Vegana");
    if (titulo.includes("glúten")) tags.push("🌾 Sem Glúten");
    if (titulo.includes("funcional")) tags.push("🌿 Funcional");

    return tags.slice(0, 2);
  }

  // ============================
  // Favoritos
  // ============================
  window.toggleFavorito = function(slug) {

  if (favoritos.includes(slug)) {
    favoritos = favoritos.filter(f => f !== slug);
  } else {
    favoritos.push(slug);
  }

  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  const btn = document.querySelector(`[data-slug="${slug}"]`);

  if (btn) {

    const ativo = favoritos.includes(slug);

    btn.classList.toggle("active", ativo);
    btn.textContent = ativo ? "❤️" : "🤍";
  }
};

});

// buscar as receitas mais novas para exibir index.html novidades
function obterNovidades(receitas, limite = 8) {
  return receitas
    .filter(receita => receita.status === "publicada")
    .map(receita => {
      const ultimaDataVersao = receita.versoes?.length
        ? Math.max(
            ...receita.versoes.map(v => new Date(v.data).getTime())
          )
        : 0;

      const dataCriacao = new Date(receita.dataCriacao).getTime();

      return {
        ...receita,
        dataNovidade: Math.max(dataCriacao, ultimaDataVersao)
      };
    })
    .sort((a, b) => b.dataNovidade - a.dataNovidade)
    .slice(0, limite);
}

//renderizar novidades do index.html - 12/06/2026 
function renderNovidades(receitas) {

  const container = document.querySelector('.carrossel');

  if (!container) return;

  const novidades = obterNovidades(receitas);

  container.innerHTML = novidades.map(r => `
    <article class="card-index">
      <img
        src="imagens/receitas/${r.imagem}"
        alt="${r.titulo}"
        class="card-index-img">

      <div class="card-index-body">
        <h3>${r.titulo}</h3>

        <a href="receita.html?slug=${r.slug}" class="btn-card">
          Ver Receita
        </a>
      </div>
    </article>
  `).join('');

  inicializarCarrossel();
}

// carregar as novas receitas para fazer as novidades - 12/06/2026
function carregarNovidades() {
  fetch('/receitas')
    .then(res => res.json())
    .then(receitas => {
      renderNovidades(receitas);
 
    });
}

