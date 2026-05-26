document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const { ok, json } = await api.post('/login', { email, senha });

        if (ok && json && json.success) {
            sessionStorage.setItem('usuarioLogado', JSON.stringify(json.usuario));
            mostrarNotificacao(`Bem-vindo, ${json.usuario.nome}! Entrando no sistema...`, 'sucesso');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
            return;
        }

        mostrarNotificacao(json?.message || 'E-mail ou senha incorretos.', 'erro');
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
    }
});