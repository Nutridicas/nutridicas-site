document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("homeReceitas");

  // ✅ Se não existir container, não roda
  if (!container) return;

  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  // carregar receitas do servidor
  fetch("/receitas")
    .then(res => res.json())
    .then(receitas => {

      // ⭐ TOP receitas da semana (primeiras 6 publicadas)
      const top = receitas
        .filter(r => r.status === "publicada")
        .slice(0, 6);

      criarCarrossel("🔥 Top Receitas da Semana", top);

      // categorias automáticas
      const categorias = {};

      receitas.forEach(r => {
        const cat = r.versoes?.[0]?.conteudo?.categoria || "Outras";
        if (!categorias[cat]) categorias[cat] = [];
        categorias[cat].push(r);
      });

      // criar carrossel para cada categoria
      Object.keys(categorias).forEach(cat => {
        criarCarrossel("📌 " + cat, categorias[cat].slice(0, 10));
      });

    });

  // ============================
  // Criar carrossel Netflix
  // ============================
  function criarCarrossel(titulo, lista) {

    container.innerHTML += `
      <h2 class="netflix-title">${titulo}</h2>
      <div class="carousel" id="car-${titulo.replace(/\s/g,"")}"></div>
    `;

    const carrossel = document.getElementById(
      `car-${titulo.replace(/\s/g,"")}`
    );

    lista.forEach(r => {

      // ✅ caminho correto da imagem
      const img = r.imagem
        ? `imagens/receitas/${r.imagem}`
        : "imagens/placeholder.jpg";

      // tags automáticas
      const tags = gerarTags(r);

      // favorito
      const isFav = favoritos.includes(r.slug);

      carrossel.innerHTML += `
        <div class="recipe-card">

          <button class="fav-btn ${isFav ? "active" : ""}"
            onclick="toggleFavorito('${r.slug}')">
            ${isFav ? "❤️" : "🤍"}
          </button>

          <a href="receita.html?slug=${r.slug}">
            <img src="${img}" alt="${r.titulo}">
          </a>

          <div class="recipe-info">
            <h3>${r.titulo}</h3>

            <div class="tags">
              ${tags.map(t => `<span class="tag">${t}</span>`).join("")}
            </div>
          </div>

        </div>
      `;
    });
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

    return tags.slice(0, 3);
  }

  // ============================
  // Favoritos sem login
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

