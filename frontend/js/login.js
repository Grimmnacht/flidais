document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
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
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('usuarioLogado', JSON.stringify(result.usuario));
            
            mostrarNotificacao(`Bem-vindo, ${result.usuario.nome}! Entrando no sistema...`, 'sucesso');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
        } else {
            mostrarNotificacao(result.message || 'E-mail ou senha incorretos.', 'erro');
        }

    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
    }
});