window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main-content');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === '1';
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
    sidebar.classList.toggle('w-76');
    sidebar.classList.toggle('w-24.5');
    sidebar.classList.toggle('sidebar-collapsed');
    main.classList.toggle('ml-76');
    main.classList.toggle('ml-24.5');
    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
}