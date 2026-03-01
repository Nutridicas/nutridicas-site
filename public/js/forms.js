
document.addEventListener("DOMContentLoaded", () => {

  /* ===== CAMPOS CONDICIONAIS ===== */
  const selectObjetivo = document.getElementById("objetivo");
  const campoPatologia = document.getElementById("campo-patologia");
  const campoEmagrecimento = document.getElementById("campo-emagrecimento");

  if (selectObjetivo && campoPatologia && campoEmagrecimento) {
    const inputPatologia = campoPatologia.querySelector("input");
    const inputEmagrecimento = campoEmagrecimento.querySelector("input");

    function atualizarCampos() {
      const valor = selectObjetivo.value;

      campoPatologia.classList.toggle(
        "is-visible",
        valor === "patologia"
      );
      campoEmagrecimento.classList.toggle(
        "is-visible",
        valor === "emagrecimento"
      );

      inputPatologia.required = valor === "patologia";
      inputEmagrecimento.required = valor === "emagrecimento";

      if (valor !== "patologia") inputPatologia.value = "";
      if (valor !== "emagrecimento") inputEmagrecimento.value = "";
    }

    atualizarCampos();
    selectObjetivo.addEventListener("change", atualizarCampos);
  }

  /* ===== ENVIO FORM (FORMSpree) ===== */
  document.querySelectorAll("form[action*='formspree']").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add("form--invalid");
        return;
      }

      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (response.ok) {
        form.reset();
        form.classList.add("form--success");
      } else {
        alert("Erro ao enviar.");
      }
    });
  });

});




/* Calcular IMC - Csonulta Seleciona os elementos peso e altura*/

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