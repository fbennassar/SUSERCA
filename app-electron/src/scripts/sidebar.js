window.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main-content");
  const isCollapsed = localStorage.getItem("sidebarCollapsed") === "1";

  // Limpia clases previas
  sidebar.classList.remove("w-76", "w-21", "sidebar-collapsed");
  main.classList.remove("ml-76", "ml-21");

  if (isCollapsed) {
    sidebar.classList.add("w-21", "sidebar-collapsed");
    main.classList.add("ml-21");
  } else {
    sidebar.classList.add("w-76");
    main.classList.add("ml-76");
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main-content");
  const isCollapsed = sidebar.classList.contains("sidebar-collapsed");

  // Limpia clases previas
  sidebar.classList.remove("w-76", "w-21", "sidebar-collapsed");
  main.classList.remove("ml-76", "ml-21");

  if (!isCollapsed) {
    sidebar.classList.add("w-21", "sidebar-collapsed");
    main.classList.add("ml-21");
    localStorage.setItem("sidebarCollapsed", "1");
  } else {
    sidebar.classList.add("w-76");
    main.classList.add("ml-76");
    localStorage.setItem("sidebarCollapsed", "0");
  }
}

async function showUsersWindow() {
  try {
    const profile = await window.electronAPI.getProfileSeguro();
    console.log("Perfil actual:", profile);

    if (!profile || !profile.rol || profile.rol.nombre !== "Gerente") {
      Swal.fire('No tienes el nivel de acceso para ingresar a este modulo', '', 'error');
      return;
    }

    window.location.href = "../views/usuarios.html";
  } catch (error) {
    alert("Error al verificar permisos del usuario.");
    console.error(error);
  }
}
