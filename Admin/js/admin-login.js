document.getElementById("loginAdmin").addEventListener("submit", e => {
  e.preventDefault();
  const senha = e.target.querySelector("input").value;

  if (senha === "nutri2026") {
    localStorage.setItem("admin_logado", "true");
    location.href = "dashboard.html";
  } else {
    alert("Senha incorreta");
  }
});

document.getElementById("loginAdmin").addEventListener("submit", e => {
  e.preventDefault();

  const senha = e.target.querySelector("input").value;

  if (senha === "nutri2026") {
    localStorage.setItem("admin_logado", "true");
    window.location.href = "dashboard.html";
  } else {
    alert("Senha incorreta");
  }
});
