document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.classList.add('hidden');

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

            alert(`Bem-vindo, ${result.usuario.nome}! Redirecionando para o Dashboard...`);
            window.location.href = 'dashboard.html';

        } else {

            errorMessage.textContent = result.message || 'Erro ao fazer login.';
            errorMessage.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Erro na requisição:', error);
        errorMessage.textContent = 'Não foi possível conectar ao servidor.';
        errorMessage.classList.remove('hidden');
    }
});