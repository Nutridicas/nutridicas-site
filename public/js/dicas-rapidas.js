// dicas rápidas para index.html  e receitas.html - modificada 23/04/2026
// modificada 23/05/2026

function renderizarDicasUteis(dicas) {
  console.log("RENDERIZANDO", dicas);
    const container = document.getElementById('lista-dicas');
    if (!container) return;

    const htmlCards = dicas.map(dica => {
        const icones = { "Grãos": "🌾", "Cozimento": "🔥", "Armazenar": "❄️", "Saúde": "🌿", "default": "💡" };
        const icone = icones[dica.tema] || icones.default;
        
        // Garante que pegue o título correto (nome ou titulo) e o slug
        const tituloDica = dica.nome || dica.titulo || 'Dica';
        const slugDica = dica.slug || '';

        return `
            <div class="dica-item-card" style="background:#fff !important; border:1px solid #e0eadd !important; padding:25px !important; border-radius:20px !important; display:flex !important; flex-direction:column !important; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important; margin-bottom: 10px;">
                <div style="display:flex !important; align-items:center !important; gap:10px !important; margin-bottom:10px !important;">
                    <span style="font-size:1.5rem !important;">${icone}</span>
                    <span style="font-weight:800 !important; color:#2d5a27 !important; font-size:0.75rem !important; text-transform:uppercase !important; font-family: sans-serif !important;">${dica.tema || 'Dica'}</span>
                </div>
                <h4 style="margin:0 0 10px 0 !important; color:#333 !important; font-family: sans-serif !important; font-size:1.1rem !important;">${tituloDica}</h4>
                <p style="color:#666 !important; font-size:0.95rem !important; line-height:1.5 !important; flex-grow:1 !important; font-family: sans-serif !important;">${dica.resumo || dica.texto || ''}</p>
                
                <!-- Ajustado para passar id E slug na URL -->
                <a href="dicas.html?id=${dica.id}&slug=${slugDica}" 
                   class="btn-detalhes" 
                   style="display:block !important; background:#0056b3 !important; color:#fff !important; padding:12px !important; border-radius:10px !important; text-decoration:none !important; font-weight:bold !important; text-align:center !important; margin-top:20px !important; font-family: sans-serif !important;">
                   Saiba mais →
                </a>
          </div>
        `;
    }).join('');

    container.style.cssText = "display: grid !important; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important; gap: 25px !important;";
    container.innerHTML = htmlCards;
}


//
function ordenarPorPopularidade(dicas) {
  const ranking = JSON.parse(localStorage.getItem("rankingDicas")) || {};
  return dicas.sort((a, b) => (ranking[b.id] || 0) - (ranking[a.id] || 0));
}

function registrarClique(id) {
    const ranking = JSON.parse(localStorage.getItem("rankingDicas")) || {};
    ranking[id] = (ranking[id] || 0) + 1;
    localStorage.setItem("rankingDicas", JSON.stringify(ranking));
}

// Dicas do dia para index.html
function getParamsFromURL() {
  const params = new URLSearchParams(window.location.search);

  return {
    id: params.get("id"),
    slug: params.get("slug")
  };
}


if (document.getElementById('dica-do-dia')) {

  fetch('/dicas-rapidas')
    .then(res => res.json())
    .then(data => {

      const dicas = data.dicas_rapidas;

  //    const dicasOrdenadas = ordenarPorPopularidade(dicas);

      // ✅ filtrar apenas dicas ativas
      const dicasAtivas = dicas.filter(d => d.ativa !== false);

      // ⚠️ evitar erro se não tiver dicas
      if (dicasAtivas.length === 0) return;

      const hoje = new Date();

      // ✅ índice mais inteligente (não repete sempre igual)
      const indice = Math.floor(
        (hoje.getTime() / (1000 * 60 * 60 * 24)) % dicasAtivas.length
      );

      const dica = dicasAtivas[indice];

      const containerDicas = document.getElementById('dica-do-dia');

      containerDicas.innerHTML = `
        <div class="card-dica destaque">
          <span class="categoria">${dica.categoria}</span>
          <h3>${dica.titulo}</h3>
          <p>${dica.texto}</p>
          <a href="/dicas.html?id=${dica.id}&slug=${dica.slug}"">Ver dica completa →</a>
        </div>
      `;
    });

}
// buscar dicas por tags = 11/05/2026
function gerarDicasRelacionadas(receita, dicas) {

const STOP_WORDS_DICAS = [
  "oleo",
  "sal",
  "agua",
  "arroz",
  "farinha",
  "acucar",
  "manteiga",
  "ovo"
];
  // pega ingredientes da receita
  const ingredientesTexto =
    receita.versoes?.[0]?.conteudo?.ingredientes || [];

  // normalizar ingredientes
  const ingredientesNormalizados =
  ingredientesTexto

    .map(i =>

      i
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[0-9]/g, "")
        .replace(/[≈()]/g, "")
        .replace(
          /xicaras?|colheres?|colher|xicara|gramas?|ml|kg|g|de|da|do|sem|com|media|medio|picado|picada|opcional/gi,
          ""
        )
        .replace(/[^a-z\s]/g, " ")
        .trim()

    )

    .flatMap(i => i.split(/\s+/))

    .filter(palavra =>
      palavra.length > 2 &&
      !STOP_WORDS_DICAS.includes(palavra)
    );

    console.log("INGREDIENTES:", ingredientesNormalizados);

   return dicas
    .map(dica => {

      let pontos = 0;

      // TAGS
      dica.tags?.forEach(tag => {

        const tagNormalizada =
          tag
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // compara com ingredientes
        ingredientesNormalizados.forEach(ing => {

          if (ing.includes(tagNormalizada)) {
            pontos += 3;
          }

        });

        // compara tags da receita
        if (receita.tags?.includes(tag)) {
          pontos += 2;
        }

      });

      // tipo da dica
      const tipo =
        (dica.tipo || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      ingredientesNormalizados.forEach(ing => {

       if (tipo && ing === tipo) {
          pontos += 4;
        }

      });

      return {
        ...dica,
        pontos
      };

    })

    .filter(d => d.pontos > 0)

    .sort((a, b) => b.pontos - a.pontos);
}