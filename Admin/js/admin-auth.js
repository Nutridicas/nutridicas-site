document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginAdmin");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const senha = document.getElementById("senha").value;

    try {
      const resposta = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha })
      });

      if (resposta.ok) {
        window.location.href = "/dashboard";
      } else {
        alert("Senha inválida");
      }

    } catch (erro) {
      console.error("Erro no login:", erro);
    }
  });
});