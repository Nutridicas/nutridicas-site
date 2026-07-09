// Mnesagem para o usuário - Criado em 21/03/2026
//

function ExibirMensagem(mensagem, tipo = "erro") {
  const div = document.createElement("div");

  div.textContent = mensagem;
  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.right = "20px";
  div.style.padding = "12px 20px";
  div.style.color = "#fff";
  div.style.borderRadius = "8px";
  div.style.zIndex = "9999";
  div.style.fontFamily = "Arial";

  if (tipo === "erro") {
    div.style.backgroundColor = "#e74c3c";
  } else if (tipo === "sucesso") {
    div.style.backgroundColor = "#2ecc71";
  } else {
    div.style.backgroundColor = "#3498db";
  }

  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

// Função com animação
function toast(mensagem, tipo = "erro") {
  const div = document.createElement("div");

  div.textContent = mensagem;
  div.className = `toast ${tipo}`;

  document.body.appendChild(div);

  setTimeout(() => {
    div.classList.add("show");
  }, 10);

  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => div.remove(), 300);
  }, 3000);
}