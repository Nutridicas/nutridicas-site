
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  const submenuButtons = document.querySelectorAll(".submenu-btn");

  if (!toggle || !menu) return;

  /* MENU HAMBÚRGUER */
  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  /* SUBMENUS NO MOBILE */
  submenuButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        const submenu = btn.nextElementSibling;
        submenu.classList.toggle("open");
      }
    });
  });
});
