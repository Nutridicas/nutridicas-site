document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("homeReceitas");
  if (!container) return;

  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  fetch("/receitas")
    .then(res => res.json())
    .then(receitas => {

      const publicadas = receitas.filter(r => r.status === "publicada");

      // 🔥 Top 3
      const top = publicadas.slice(0, 3);
      criarSecao("🔥 Top Receitas da Semana", top);

      // 📌 Categorias automáticas
      const categorias = {};

      publicadas.forEach(r => {
        const cat = r.categoria || "Outras";

        if (!categorias[cat]) categorias[cat] = [];
        categorias[cat].push(r);
      });

      Object.keys(categorias).forEach(cat => {
        criarSecao("📌 " + cat, categorias[cat].slice(0, 5));
      });
    });

  // ============================
  // Criar seção moderna
  // ============================
  function criarSecao(titulo, lista) {

    const bloco = document.createElement("div");
    bloco.className = "categoria-bloco";

    bloco.innerHTML = `
      <h2 class="titulo-categoria">${titulo}</h2>
      <div class="receitas-row"></div>
    `;

    const row = bloco.querySelector(".receitas-row");

    lista.forEach(r => {

      const img = r.imagem
        ? `/imagens/receitas/${r.imagem}`
        : `/imagens/placeholder.jpg`;

      const tags = gerarTags(r);
      const isFav = favoritos.includes(r.slug);

      const card = document.createElement("article");
      card.className = "card-receita";

      card.innerHTML = `
        <a href="receita.html?slug=${r.slug}">
          <img src="${img}" alt="${r.titulo}">
        </a>

        <div class="card-conteudo">

          <button class="fav-btn ${isFav ? "active" : ""}"
            onclick="toggleFavorito('${r.slug}')">
            ${isFav ? "❤️" : "🤍"}
          </button>

          <h3>${r.titulo}</h3>

          <div class="tags">
            ${tags.map(t => `<span class="tag">${t}</span>`).join("")}
          </div>

        </div>
      `;

      row.appendChild(card);
    });

    container.appendChild(bloco);
  }

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

    return tags.slice(0, 3);
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
    location.reload();
  };

});