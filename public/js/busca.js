// atualizado em 12/02/26 - BUSCA PREMIUM NUTRICHEF 🔥
//====================================================

// ===============================================
// 🔥 BUSCA MASTER NUTRIDICAS (TÍTULO + TAGS + INGREDIENTES)
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("searchResults");

  let receitasCache = [];
  let selecionadoIndex = -1;

  // ============================
  // Escape RegExp
  // ============================
  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ============================
  // Highlight termo
  // ============================
  function destacarTexto(texto, termo) {
    if (!termo || !texto) return texto;

    const safe = escapeRegExp(termo);
    const regex = new RegExp(`(${safe})`, "gi");

    return texto.replace(regex, "<mark>$1</mark>");
  }

  // ============================
  // Cache: 
  // ============================
  async function carregarReceitas() {
    if (receitasCache.length > 0) return receitasCache;

    const res = await fetch("/receitas");
    receitasCache = await res.json();

    return receitasCache;
  }

  // ============================
  // Render dropdown
  // ============================
  function exibirDropdown(lista, termo) {
  selecionadoIndex = -1;

  if (!lista.length) {
    resultsContainer.innerHTML =
      `<div class="search-item">Nenhuma receita encontrada 😢</div>`;
    resultsContainer.classList.add("active");
    return;
  }

  resultsContainer.innerHTML = lista.map(receita => {

    const imgSrc = receita.imagem
      ? `/imagens/receitas/${receita.imagem}`
      : `/imagens/placeholder.jpg`;

    return `
      <div class="search-item"
           onclick="window.location.href='/receitas/${receita.slug}'">

        <img src="${imgSrc}" class="search-thumb">

        <div>
          <strong>${destacarTexto(receita.titulo, termo)}</strong><br>
          <small>Categoria: ${destacarTexto(receita.categoria, termo)}</small>
        </div>
      </div>
    `;
  }).join("");

  resultsContainer.classList.add("active");


    // clique abre receita
    document.querySelectorAll(".search-item").forEach((item) => {
      item.addEventListener("click", () => {
        const i = item.dataset.index;
        window.location.href = `receita.html?slug=${lista[i].slug}`;
      });
    });
  }

  // ============================
  // Busca avançada
  // ============================
  function filtrarReceitas(receitas, termo) {
    return receitas.filter((r) => {
      const tituloMatch = r.titulo?.toLowerCase().includes(termo);

      //const categoriaMatch = r.categoria?.some((c) =>
     //   c.toLowerCase().includes(termo)
     // );

      const categoriaMatch = r.categoria
      ?.toLowerCase()
      .includes(termo);

      const tagsMatch = r.tags?.some((t) =>
        t.toLowerCase().includes(termo)
      );

     const ingredientesMatch = r.ingredientes?.some((ing) =>
        ing.toLowerCase().includes(termo)
      );

     //busca por autor e enviada por 02/03/2026
    const autorMatch = r.autor?.nome?.toLowerCase().includes(termo) || 
        r.autor?.enviadaPor?.toLowerCase().includes(termo);
  
    const avaliacaoMatch = parseFloat(r.avaliacoes?.media) >= 4;               

  //busca por autor e enviada por 02/03/2026
 const dificuldadeMatch = r.dificuldade?.toLowerCase().includes(termo);

        // atualizado em 02/03/26
     return tituloMatch || categoriaMatch || tagsMatch || ingredientesMatch || autorMatch || avaliacaoMatch || dificuldadeMatch;
    });
    
  }

  // ============================
  // Evento input
  // ============================
  input.addEventListener("input", async (e) => {
    const termo = e.target.value.trim().toLowerCase();

    if (termo.length < 2) {
      resultsContainer.classList.remove("active");
      resultsContainer.innerHTML = "";
      return;
    }

    const receitas = await carregarReceitas();
    const filtrados = filtrarReceitas(receitas, termo);

    exibirDropdown(filtrados, termo);
  });

  // ============================
  // Teclado ↑ ↓ Enter
  // ============================
  input.addEventListener("keydown", (e) => {
    const items = resultsContainer.querySelectorAll(".search-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      selecionadoIndex = (selecionadoIndex + 1) % items.length;
    }

    if (e.key === "ArrowUp") {
      selecionadoIndex =
        (selecionadoIndex - 1 + items.length) % items.length;
    }

    items.forEach((el) => el.classList.remove("selected"));

    if (selecionadoIndex >= 0) {
      items[selecionadoIndex].classList.add("selected");
    }

    if (e.key === "Enter") {
        const termo = input.value.trim();

        if (termo.length < 2) return;

        window.location.href = `buscar.html?q=${encodeURIComponent(termo)}`;
      }
  });

  // ============================
  // Clique fora fechar
  // ============================
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.remove("active");
    }
  });
});

