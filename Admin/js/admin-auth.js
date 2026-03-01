document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginAdmin");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const senha = document.getElementById("senha").value;

    // 🔐 senha simples (depois vira token/API)
    if (senha === "nutri123") {
      localStorage.setItem("nutri_admin", "true");
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("erro").style.display = "block";
    }
  });
});


