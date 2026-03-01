document.addEventListener("DOMContentLoaded", () => {

  let planoSelecionado = null;

  const planos = document.querySelectorAll(".selecionar-plano");
  const boxPagamento = document.getElementById("box-pagamento");
  const textoPlano = document.getElementById("plano-selecionado");
  const btnFinalizar = document.getElementById("btn-finalizar");

  planos.forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".plano");
      planoSelecionado = card.dataset.plano;

      textoPlano.textContent =
        planoSelecionado === "anual"
          ? "Plano selecionado: Anual (12 meses)"
          : "Plano selecionado: Semestral (6 meses)";

      boxPagamento.classList.remove("hidden");
      boxPagamento.scrollIntoView({ behavior: "smooth" });
    });
  });

  btnFinalizar.addEventListener("click", () => {
    if (!planoSelecionado) {
      alert("Selecione um plano.");
      return;
    }

    const metodo = document.querySelector('input[name="pagamento"]:checked').value;

    // 🔐 FUTURA INTEGRAÇÃO COM API
    // Aqui entra MercadoPago / Stripe / Pix etc.

    // SIMULA PAGAMENTO APROVADO
    window.location.href = "confirmacao.html";
  });

});

function pagar(plano) {
  // FUTURA INTEGRAÇÃO COM API
  console.log("Plano escolhido:", plano);

  // Simulação de pagamento aprovado
  setTimeout(() => {
    localStorage.setItem("nutri_premium", "true");
    window.location.href = "confirmacao.html";
  }, 800);
}

//==========================
// Mercado Pago
//=========================
app.post("/checkout", async (req, res) => {
  const preference = {
    items: [
      {
        title: "Assinatura Nutrichef Premium",
        quantity: 1,
        unit_price: 19.90
      }
    ],
    back_urls: {
      success: "http://localhost:3000/pagamento-sucesso.html",
      failure: "http://localhost:3000/pagamento-erro.html"
    },
    auto_return: "approved"
  };

  try {
    const resposta = await mercadopago.preferences.create(preference);
    res.json({ url: resposta.body.init_point });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao criar pagamento" });
  }
});

