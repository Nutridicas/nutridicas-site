// criado em 10/02/26 - 20:20 - página consulta
//==========================

fetch("http://localhost:3001/pagamento/criar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tipo: "consulta"
  })
})
.then(r => r.json())
.then(d => location.href = d.init_point);

//

document.addEventListener("DOMContentLoaded", () => {

  const params =
    new URLSearchParams(window.location.search);

  const pago =
    params.get("pagamento") === "ok";

  const form =
    document.querySelector(".consulta_form");

  if (!pago) {

    form.style.opacity = "0.5";
    form.style.pointerEvents = "none";

    const aviso =
      document.createElement("div");

    aviso.innerHTML =
      "<button onclick='pagarConsulta()'>💳 Pagar Consulta para Desbloquear</button>";

    form.before(aviso);
  }

});

async function pagarConsulta() {

  const res = await fetch("/criar-pagamento", {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      produto:"consulta"
    })
  });

  const data = await res.json();
  window.location.href = data.init_point;

}

//=====================
import { getParams } from "./utils/urlParams.js";

const params = getParams();

