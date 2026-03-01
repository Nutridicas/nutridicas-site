document.addEventListener("DOMContentLoaded", () => {

  /* =============================
     STATUS PREMIUM
  ============================== */
  const isPremium = localStorage.getItem("nutri_premium") === "true";

  /* =============================
     BLOQUEIO / DESBLOQUEIO
  ============================== */
  document.querySelectorAll(".premium").forEach(bloco => {

    bloco.classList.remove("locked", "unlocked");

    if (isPremium) {
      bloco.classList.add("unlocked");
    } else {
      bloco.classList.add("locked");
    }
  });

  /* =============================
     MENU INTELIGENTE
     (aparece só para premium)
  ============================== */
  document.querySelectorAll(".menu-premium").forEach(item => {
    item.style.display = isPremium ? "block" : "none";
  });

  /* =============================
     LINKS DE PAGAMENTO
     Premium não volta a pagar
  ============================== */
  document.querySelectorAll('a[href="pagamento.html"]').forEach(link => {
    link.addEventListener("click", e => {
      if (isPremium) {
        e.preventDefault();
        window.location.href = "ja-premium.html";
      }
    });
  });

  /* =============================
     BOTÃO SIMULADO (DEV / TESTE)
     Remover em produção
  ============================== */
  document.querySelectorAll("[data-premium-unlock]").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.setItem("nutri_premium", "true");
      location.reload();
    });
  });

});


// MENU INTELIGENTE PREMIUM
document.addEventListener("DOMContentLoaded", () => {
  const isPremium = localStorage.getItem("nutri_premium") === "true";

  document.querySelectorAll(".menu-premium").forEach(item => {
    if (isPremium) {
      item.style.display = "block";
    }
  });
});


