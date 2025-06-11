window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === '1';

    // Limpia clases previas
    sidebar.classList.remove('w-76', 'w-24.5', 'sidebar-collapsed');
    main.classList.remove('ml-76', 'ml-24.5');

    if (isCollapsed) {
        sidebar.classList.add('w-24.5', 'sidebar-collapsed');
        main.classList.add('ml-24.5');
    } else {
        sidebar.classList.add('w-76');
        main.classList.add('ml-76');
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');

    // Limpia clases previas
    sidebar.classList.remove('w-76', 'w-24.5', 'sidebar-collapsed');
    main.classList.remove('ml-76', 'ml-24.5');

    if (!isCollapsed) {
        sidebar.classList.add('w-24.5', 'sidebar-collapsed');
        main.classList.add('ml-24.5');
        localStorage.setItem('sidebarCollapsed', '1');
    } else {
        sidebar.classList.add('w-76');
        main.classList.add('ml-76');
        localStorage.setItem('sidebarCollapsed', '0');
    }
}