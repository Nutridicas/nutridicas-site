// ======================================================
// MENU PROFISSIONAL – NUTRICHEF
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu");
  const megaItems = document.querySelectorAll(".has-mega > .submenu-btn");

  /* ==========================================
     MENU HAMBÚRGUER (MOBILE)
  ========================================== */
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      menuToggle.classList.toggle("active"); // 🔥 ESSENCIAL
      menuToggle.setAttribute(
        "aria-expanded",
        menu.classList.contains("active")
      );
    });
  }


  /* ==========================================
     MEGA MENU (MOBILE)
  ========================================== */
  megaItems.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const parent = btn.parentElement;

      if (window.innerWidth <= 768) {
        e.preventDefault();

        // fecha outros abertos
        document.querySelectorAll(".has-mega").forEach(item => {
          if (item !== parent) {
            item.classList.remove("active");
          }
        });

        parent.classList.toggle("active");
      }
    });
  });

  /* ==========================================
     FECHAR MENU AO CLICAR FORA (MOBILE)
  ========================================== */
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      !menu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      menu.classList.remove("active");
    }
  });

  /* ==========================================
     TECLADO (ACESSIBILIDADE)
  ========================================== */
  document.querySelectorAll(".submenu-btn").forEach(btn => {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

});


/* ==========================================
   BUSCA FUNCIONAL
========================================== */
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const termo = searchInput.value.toLowerCase();
    document.querySelectorAll("main a").forEach(link => {
      link.style.display = link.textContent.toLowerCase().includes(termo)
        ? "block"
        : "none";
    });
  });
}

/* ==========================================
   FOCUS TRAP (ACESSIBILIDADE)
========================================== */
const focusableSelectors =
  'a, button, input, [tabindex]:not([tabindex="-1"])';

function trapFocus(container) {
  const focusable = container.querySelectorAll(focusableSelectors);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  container.addEventListener("keydown", e => {
    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

if (menu) {
  trapFocus(menu);
}

/* ==========================================
   ARIA – DESKTOP
========================================== */
document.querySelectorAll(".has-mega").forEach(item => {
  const btn = item.querySelector(".submenu-btn");
  const menu = item.querySelector(".mega-menu");

  btn.addEventListener("focus", () => {
    btn.setAttribute("aria-expanded", "true");
  });

  btn.addEventListener("blur", () => {
    btn.setAttribute("aria-expanded", "false");
  });
});


    // Seleciona os elementos
    const inputPeso = document.getElementById('peso');
    const inputAltura = document.getElementById('altura');
    const displayIMC = document.getElementById('valor-imc');

    // Adiciona o evento de "escutar" a digitação
    inputPeso.addEventListener('input', calcularIMC);
    inputAltura.addEventListener('input', calcularIMC);

    // Função para calcular
    function calcularIMC() {
        const peso = parseFloat(inputPeso.value);
        const altura = parseFloat(inputAltura.value);

        if (peso > 0 && altura > 0) {
            const imc = peso / (altura * altura);
            displayIMC.textContent = imc.toFixed(2); // Mostra com 2 casas decimais
        } else {
            displayIMC.textContent = "0.00";
        }
    }

  //ler nutri_form
      const form = document.querySelector('.nutri__form');
      const feedback = document.querySelector('.form-feedback');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const response = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          form.hidden = true;
          feedback.hidden = false;
        } else {
          alert('Erro ao enviar. Tente novamente.');
        }
      });


// ler nutri-form
      const form = document.querySelector('.nutri-form');
      const feedback = document.querySelector('.form-feedback');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const response = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          form.hidden = true;
          feedback.hidden = false;
        } else {
          alert('Erro ao enviar. Tente novamente.');
        }
      });

// ler nutri-form
const formConsulta = document.querySelector('.consulta__form');
const feedbackConsulta = document.querySelector('.consulta-feedback');

formConsulta.addEventListener('submit', async (e) => {
  e.preventDefault();

  const response = await fetch(formConsulta.action, {
    method: formConsulta.method,
    body: new FormData(formConsulta),
    headers: { 'Accept': 'application/json' }
  });

  if (response.ok) {
    formConsulta.style.display = 'none';
    feedbackConsulta.style.display = 'block';
  } else {
    alert('Erro ao enviar. Tente novamente.');
  }
});


//envio de retorno formspeed


document.querySelectorAll('form[action*="formspree"]').forEach(form => {

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const feedback = form.nextElementSibling;

    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.style.display = 'none';
      feedback.style.display = 'block';
    } else {
      alert('Erro ao enviar. Tente novamente.');
    }
  });

});


// mostrar patologia específica na consulta online

document.addEventListener("DOMContentLoaded", () => {
  const selectObjetivo = document.getElementById("objetivo");
  const campo = document.getElementById("campo-patologia");
  const input = campo?.querySelector("input");

  if (!selectObjetivo || !campo || !input) return;

  function atualizarCampo() {
    const ativo = selectObjetivo.value === "patologia";

    campo.classList.toggle("is-visible", ativo);
    input.required = ativo;

    if (!ativo) input.value = "";
  }

  // executa ao carregar a página
  atualizarCampo();

  // executa ao mudar o select
  selectObjetivo.addEventListener("change", atualizarCampo);
});


// mostrar meta de peso a perder na consulta online

document.addEventListener("DOMContentLoaded", () => {
  const selectObjetivo = document.getElementById("objetivo");
  const campo = document.getElementById("campo-emagrecimento");
  const input = campo?.querySelector("input");

  if (!selectObjetivo || !campo || !input) return;

  function atualizarCampo() {
    const ativo = selectObjetivo.value === "campo-emagrecimento";

    campo.classList.toggle("is-visible", ativo);
    input.required = ativo;

    if (!ativo) input.value = "";
  }

  // executa ao carregar a página
  atualizarCampo();

  // executa ao mudar o select
  selectObjetivo.addEventListener("change", atualizarCampo);
});