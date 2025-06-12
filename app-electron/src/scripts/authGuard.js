window.addEventListener('DOMContentLoaded', async () => {

    try {

        const user = await window.electronAPI.getUser();

        if (!user) {
            window.location.href = '../views/login.html';
        }

    } catch (error) {
        window.location.href = '../views/login.html';
    }
});
