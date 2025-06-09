window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === '1';
    if (isCollapsed) {
        sidebar.classList.add('w-24.5', 'sidebar-collapsed');
    } else {
        sidebar.classList.add('w-76');
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('w-76');
    sidebar.classList.toggle('w-24.5');
    sidebar.classList.toggle('sidebar-collapsed');
    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
}