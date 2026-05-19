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

    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.warn("Container de toasts não encontrado no HTML.");
            return;
        }

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
        console.log("Tentando buscar pacientes no servidor...");
        const response = await fetch('http://localhost:3000/pacientes-recorrentes');
        
        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.status}`);
        }
        
        const pacientes = await response.json();
        console.log("Pacientes recebidos do banco:", pacientes);

        if (!petSelect) {
            console.error("Elemento petSelect não encontrado no HTML.");
            return;
        }

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
                const response = await fetch('http://localhost:3000/reconsulta', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosReconsulta)
                });

                const result = await response.json();

                if (result.success) {
                    mostrarNotificacao('Reconsulta agendada com sucesso!', 'sucesso');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    mostrarNotificacao('Erro ao agendar reconsulta: ' + result.error, 'erro');
                }
            } catch (error) {
                console.error('Erro na requisição de reconsulta:', error);
                mostrarNotificacao('Erro de conexão com o servidor.', 'erro');
            }
        });
    }
});