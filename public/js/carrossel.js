// Criado para controlar carrossel do index.html 12/04/2026

// Criado para controlar carrossel do index.html 12/04/2026
// Atualizado em 29/05/2026: Exibição fixa de 3 cards e título dinâmico

const carrossel = document.querySelector('.carrossel');
const btnNext = document.querySelector('.next');
const btnPrev = document.querySelector('.prev');

 



// Inicializar carrossel
function inicializarCarrossel() {

  const carrossel = document.querySelector(".carrossel");
  const btnNext = document.querySelector(".next");
  const btnPrev = document.querySelector(".prev");

  const cards = document.querySelectorAll(".card-index");

  if (!cards.length) return;

  const getCardWidth = () =>
    cards[0].offsetWidth + 24; // mesmo gap do CSS

  btnNext.onclick = () => {
    carrossel.scrollBy({
      left: getCardWidth(),
      behavior: "smooth"
    });
  };

  btnPrev.onclick = () => {
    carrossel.scrollBy({
      left: -getCardWidth(),
      behavior: "smooth"
    });
  };

  // atualiza ao rolar
  carrossel.addEventListener("scroll", atualizarBotoes);

  // estado inicial
  atualizarBotoes();
}

// Para desabilitar os botões do carrossel quando chegar ao final - 14/06/2026
function atualizarBotoes() {

  const maxScroll =
    carrossel.scrollWidth - carrossel.clientWidth;

  btnPrev.disabled = carrossel.scrollLeft <= 5;

  btnNext.disabled =
    carrossel.scrollLeft >= maxScroll - 5;
}

