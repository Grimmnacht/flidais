document.getElementById('cadastroUsuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const result = await response.json();

        if (result.success) {
            alert('Conta criada com sucesso! Seja bem-vindo ao Flidais.');

            sessionStorage.setItem('usuarioLogado', JSON.stringify(result.usuario));

            window.location.href = 'dashboard.html';
        } else {
            alert(result.message || 'Erro ao criar conta.');
        }

    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Não foi possível conectar ao servidor.');
    }
});