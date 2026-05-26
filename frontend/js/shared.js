window.API_BASE_URL = 'http://localhost:3000';

window.buildApiUrl = function (path) {
    if (!path) return window.API_BASE_URL;
    return path.startsWith('http') ? path : `${window.API_BASE_URL}${path}`;
};

window.apiFetch = async function (path, options = {}) {
    const url = window.buildApiUrl(path);
    const init = { ...options };
    init.headers = { ...(options.headers || {}) };

    if (options.body && typeof options.body !== 'string') {
        init.body = JSON.stringify(options.body);
        if (!init.headers['Content-Type'] && !init.headers['content-type']) {
            init.headers['Content-Type'] = 'application/json';
        }
    }

    const response = await fetch(url, init);
    const json = await response.json().catch(() => null);
    return {
        ok: response.ok,
        status: response.status,
        json,
        response
    };
};

window.api = {
    get: (path) => window.apiFetch(path, { method: 'GET' }),
    post: (path, body) => window.apiFetch(path, { method: 'POST', body }),
    put: (path, body) => window.apiFetch(path, { method: 'PUT', body })
};

window.mostrarNotificacao = function (mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const cores = tipo === 'sucesso'
        ? 'bg-emerald-600 text-white border-emerald-700'
        : 'bg-red-600 text-white border-red-700';

    toast.className = `${cores} px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 transition duration-300 transform translate-x-20 opacity-0 pointer-events-auto`;
    const icone = tipo === 'sucesso' ? '✨' : '⚠️';
    toast.innerHTML = `<span>${icone}</span> <span>${mensagem}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-x-20', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-x-20', 'opacity-0');
        setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
};
