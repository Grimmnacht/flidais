document.addEventListener('DOMContentLoaded', () => {
 
    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const dadosFormulario = {
            petNome: document.getElementById('petNome').value,
            petEspecie: document.getElementById('petEspecie').value,
            petRaca: document.getElementById('petRaca').value,
            petPeso: document.getElementById('petPeso').value,
            tutorNome: document.getElementById('tutorNome').value,
            tutorTelefone: document.getElementById('tutorTelefone').value
            tutorEmail: document.getElementById('tutorEmail').value
        };

        try {
            const response = await fetch('http://localhost:3000/cadastro-clinico', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosFormulario)
            });

            const result = await response.json();

            if (result.success) {
                alert('Cadastro realizado com sucesso!');

                window.location.href = 'dashboard.html';
            } else {
                alert('Erro ao realizar cadastro: ' + result.error);
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});