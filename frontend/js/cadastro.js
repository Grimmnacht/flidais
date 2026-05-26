document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const sexoSelecionado = document.querySelector('input[name="petSexo"]:checked')?.value;

        const dadosFormulario = {
            petNome: document.getElementById('petNome').value,
            petEspecie: document.getElementById('petEspecie').value,
            petRaca: document.getElementById('petRaca').value,
            petPeso: document.getElementById('petPeso').value,
            petSexo: sexoSelecionado,
            tutorNome: document.getElementById('tutorNome').value,
            tutorTelefone: document.getElementById('tutorTelefone').value,
            tutorEmail: document.getElementById('tutorEmail').value,
            agendaData: document.getElementById('agendamentoData').value,
            agendaHorario: document.getElementById('agendamentoHorario').value,
            observacao: document.getElementById('observacao').value
        };

        try {
            const { ok, json } = await api.post('/cadastro-clinico', dadosFormulario);

            if (ok && json && json.success) {
                mostrarNotificacao('Cadastro realizado com sucesso!', 'sucesso');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                return;
            }

            mostrarNotificacao('Erro ao realizar cadastro: ' + (json?.error || json?.message || 'Erro desconhecido.'), 'erro');
        } catch (error) {
            console.error('Erro na requisição:', error);
            mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
        }
    });
});