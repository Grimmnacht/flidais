document.addEventListener('DOMContentLoaded', async () => {
    console.log("Script reconsulta.js carregado com sucesso!");

    const petSelect = document.getElementById('petSelect');
    const btnVoltar = document.getElementById('btnVoltar');

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    } else {
        console.error("Botão de voltar (btnVoltar) não foi encontrado no HTML.");
    }

    try {
        console.log("Tentando buscar pacientes no servidor...");
        const { ok, json } = await api.get('/pacientes-recorrentes');

        if (!petSelect) {
            console.error("Elemento petSelect não encontrado no HTML.");
            return;
        }

        const pacientes = ok ? json : null;

        if (!pacientes || pacientes.length === 0) {
            petSelect.innerHTML = '<option value="">Nenhum paciente cadastrado</option>';
        } else {
            petSelect.innerHTML = '<option value="">-- Escolha o animal --</option>';
            pacientes.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;

                const nomeTutor = (pet.tutores && pet.tutores.nome) ? pet.tutores.nome : 'Sem tutor';
                option.textContent = `${pet.nome} (Tutor: ${nomeTutor})`;
                petSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro detalhado ao buscar pacientes:', error);
        if (petSelect) {
            petSelect.innerHTML = '<option value="">Erro ao carregar pacientes</option>';
        }
        mostrarNotificacao('Não foi possível carregar a lista de pets. Verifique o servidor.', 'erro');
    }

    const form = document.getElementById('reconsultaForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!petSelect || !petSelect.value) {
                mostrarNotificacao('Por favor, selecione um paciente válido.', 'erro');
                return;
            }

            const dadosReconsulta = {
                pacienteId: petSelect.value,
                agendaData: document.getElementById('agendaData').value,
                agendaHorario: document.getElementById('agendaHorario').value,
                observacao: document.getElementById('observacao').value
            };

            try {
                const { ok, json } = await api.post('/reconsulta', dadosReconsulta);

                if (ok && json && json.success) {
                    mostrarNotificacao('Reconsulta agendada com sucesso!', 'sucesso');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                    return;
                }

                mostrarNotificacao('Erro ao agendar reconsulta: ' + (json?.error || json?.message || 'Erro desconhecido.'), 'erro');
            } catch (error) {
                console.error('Erro na requisição de reconsulta:', error);
                mostrarNotificacao('Erro de conexão com o servidor.', 'erro');
            }
        });
    }
});