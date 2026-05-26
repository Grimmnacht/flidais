document.getElementById('cadastroUsuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const { ok, json } = await api.post('/usuarios', { nome, email, senha });

        if (ok && json && json.success) {
            mostrarNotificacao('Conta criada com sucesso! Seja bem-vindo ao Flidais.', 'sucesso');
            sessionStorage.setItem('usuarioLogado', JSON.stringify(json.usuario));

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            return;
        }

        mostrarNotificacao(json?.message || 'Erro ao criar conta.', 'erro');
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
    }
});