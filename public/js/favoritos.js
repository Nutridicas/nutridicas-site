function ativarFavorito(receita) {

  const btn = document.getElementById("btnFavorito");
  if (!btn) return;

  atualizarTexto();

  btn.addEventListener("click", () => {

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (favoritos.includes(receita.slug)) {
      favoritos = favoritos.filter(s => s !== receita.slug);
    } else {
      favoritos.push(receita.slug);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    atualizarTexto();
  });

  function atualizarTexto() {
    const favs = JSON.parse(localStorage.getItem("favoritos")) || [];
    btn.textContent = favs.includes(receita.slug)
      ? "❤️ Desfavoritar"
      : "🤍 Favoritar";
  }

}
