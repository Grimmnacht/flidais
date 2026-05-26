document.addEventListener('DOMContentLoaded', () => {
    let themeToggleBtn = document.getElementById('themeToggleBtn');

    if (!themeToggleBtn) {
        const header = document.querySelector('header');
        if (header) {
            header.classList.add('justify-between');
            const btnHTML = `
                <button id="themeToggleBtn" title="Alternar Tema" class="text-emerald-100/80 hover:text-white transition focus:outline-none ml-auto flex items-center justify-center p-1">
                    <svg id="themeIconDark" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></svg>
                    <svg id="themeIconLight" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 hidden" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" /></svg>
                </button>
            `;
            header.insertAdjacentHTML('beforeend', btnHTML);
            themeToggleBtn = document.getElementById('themeToggleBtn');
        }
    }

    const themeIconDark = document.getElementById('themeIconDark');
    const themeIconLight = document.getElementById('themeIconLight');

    function updateIcon() {
        if (!themeIconDark || !themeIconLight) return;
        if (document.documentElement.classList.contains('dark')) {
            themeIconDark.classList.add('hidden');
            themeIconLight.classList.remove('hidden');
        } else {
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
        }
    }

    updateIcon();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcon();
        });
    }
});