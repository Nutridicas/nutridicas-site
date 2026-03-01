// ============================================
// 🔥 Página de Busca NutriChef (buscar.html)
// ============================================

async function carregarReceitas() {
  const res = await fetch("/receitas");
  return await res.json();
}

function getQueryParam() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("q") || "");
}

function renderResultados(lista, termo) {
  const container = document.getElementById("resultadosLista");

  if (!lista.length) {
    container.innerHTML = `
      <p>Nenhuma receita encontrada para "<strong>${termo}</strong>" 😢</p>
    `;
    return;
  }

  container.innerHTML = lista.map(r => `
    <div class="card-receita"
      onclick="window.location.href='receita.html?slug=${r.slug}'">

<img src="${r.imagem 
    ? `/imagens/receitas/${r.imagem}` 
    : `/imagens/placeholder.jpg`}"
>
      <div class="card-info">
        <h3>
          ${r.titulo}
          ${r.premium ? `<span class="premium-badge">⭐ Premium</span>` : ""}
        </h3>

        <p>${r.categorias.join(", ")}</p>
      </div>
    </div>
  `).join("");
}

async function initBusca() {
  const termo = getQueryParam().toLowerCase();

  document.getElementById("buscaTermo").innerHTML =
    `Você pesquisou por: <strong>${termo}</strong>`;

  const receitas = await carregarReceitas();

  const filtrados = receitas.filter(r => {
    return (
      r.titulo.toLowerCase().includes(termo) ||
      r.categorias.some(c => c.toLowerCase().includes(termo)) ||
      r.tags.some(t => t.toLowerCase().includes(termo)) ||
      r.ingredientes.some(i => i.toLowerCase().includes(termo))
    );
  });

  renderResultados(filtrados, termo);
}

initBusca();
