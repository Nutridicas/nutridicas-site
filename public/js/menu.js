document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // MENU MOBILE
  // ============================
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      menuToggle.classList.toggle("active");
    });
  }

  // ============================
  // BUSCA
  // ============================
  const input = document.getElementById("searchInput");
  const resultsBox = document.getElementById("searchResults");

  if (!input || !resultsBox) return;

  let receitas = [];

  fetch("/api/receitas.json")
    .then(res => res.json())
    .then(data => receitas = data);

  input.addEventListener("input", () => {

    const termo = input.value.toLowerCase().trim();

    if (termo.length < 2) {
      resultsBox.style.display = "none";
      return;
    }

    const filtradas = receitas.filter(r =>
      r.titulo.toLowerCase().includes(termo)
    );

    resultsBox.innerHTML = "";

    if (filtradas.length === 0) {
      resultsBox.innerHTML = "<a>Nenhuma receita encontrada</a>";
      resultsBox.style.display = "block";
      return;
    }

    filtradas.slice(0, 6).forEach(r => {
      resultsBox.innerHTML += `
        <a href="receita.html?slug=${r.slug}">
          🍴 ${r.titulo}
        </a>
      `;
    });

    resultsBox.style.display = "block";
  });

  document.addEventListener("click", e => {
    if (!resultsBox.contains(e.target) && e.target !== input) {
      resultsBox.style.display = "none";
    }
  });

});

// Busca
//
document.addEventListener("DOMContentLoaded", async () => {

  const resposta = await fetch("/api/receitas.json");
  const receitas = await resposta.json();

  renderizarLista(receitas);

  const campoBusca = document.getElementById("campoBusca");
  if (!campoBusca) return;

  campoBusca.addEventListener("input", () => {

    const termo = campoBusca.value.toLowerCase();

    const filtradas = receitas.filter(r =>
      r.titulo.toLowerCase().includes(termo) ||
      r.categoria.toLowerCase().includes(termo)
    );

    renderizarLista(filtradas);
  });

});

// renderizar
function renderizarLista(lista) {

  const container = document.getElementById("listaReceitas");
  if (!container) return;

  container.innerHTML = "";

  lista.forEach(receita => {

    const card = document.createElement("div");

    card.innerHTML = `
      <a href="receita.html?slug=${receita.slug}">
        <h3>${receita.titulo}</h3>
        <p>${receita.categoria}</p>
      </a>
    `;

    container.appendChild(card);
  });
}
