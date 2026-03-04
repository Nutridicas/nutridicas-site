document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginAdmin");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const senha = document.getElementById("senha").value;

    try {
      const resposta = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ senha })
      });

      if (resposta.ok) {
        // ✅ Login correto → vai para dashboard
        window.location.href = "/dashboard";
      } else {
        // ❌ Senha errada
        document.getElementById("erro").style.display = "block";
      }

    } catch (erro) {
      console.error("Erro no login:", erro);
    }
  });
});


