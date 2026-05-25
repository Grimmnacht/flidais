document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        const cores = tipo === 'sucesso' 
            ? 'bg-emerald-600 text-white border-emerald-700' 
            : 'bg-red-600 text-white border-red-700';
        toast.className = `${cores} px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 transition duration-300 transform translate-x-20 opacity-0 pointer-events-auto`;
        
        const iconeSucesso = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>`;
        const iconeErro = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v2m0 4v.01" /><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" /></svg>`;
        
        toast.innerHTML = `<span>${tipo === 'sucesso' ? iconeSucesso : iconeErro}</span> <span>${mensagem}</span>`;

        container.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-20', 'opacity-0'), 10);
        setTimeout(() => {
            toast.classList.add('translate-x-20', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    if (!agendamentoId) {
        mostrarNotificacao('Nenhum atendimento selecionado.', 'erro');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
        return;
    }

    const protocoloSelect = document.getElementById('protocoloSelect');
    const evolucaoTexto = document.getElementById('evolucaoTexto');
    const btnFinalizarEnviar = document.getElementById('btnFinalizarEnviar');
    const btnAbrirModalCancelar = document.getElementById('btnAbrirModalCancelar');

    let telefoneTutor = "";
    let nomePet = "o Paciente";
    let atendimentoConcluido = false;

    try {
        const responseDados = await fetch(`http://localhost:3000/agendamentos/${agendamentoId}`);
        if (responseDados.ok) {
            const dadosAgendamento = await responseDados.json();
            
            if (dadosAgendamento.pacientes) {
                nomePet = dadosAgendamento.pacientes.nome;
                if (dadosAgendamento.pacientes.tutores && dadosAgendamento.pacientes.tutores.telefone) {
                    telefoneTutor = dadosAgendamento.pacientes.tutores.telefone;
                }
            }

            if (dadosAgendamento.status === 'Realizado' || dadosAgendamento.status === 'Cancelado') {
                atendimentoConcluido = true;

                document.getElementById('atendimentoTitulo').textContent = `Prontuário Fechado: ${nomePet}`;
                evolucaoTexto.value = dadosAgendamento.evolucao_clinica || 'Nenhum histórico registrado.';

                evolucaoTexto.readOnly = true;
                evolucaoTexto.classList.add('bg-gray-100', 'cursor-not-allowed', 'text-gray-500');
                protocoloSelect.disabled = true;
                protocoloSelect.classList.add('bg-gray-100', 'cursor-not-allowed');

                btnFinalizarEnviar.innerHTML = `<span>←</span> Atendimento Concluído (Voltar)`;
                btnFinalizarEnviar.className = "w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2";
            } else {

                document.getElementById('atendimentoTitulo').textContent = `Atendendo: ${nomePet}`;
                btnAbrirModalCancelar.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do paciente:', error);
    }

    const modalCancelar = document.getElementById('modalCancelar');
    const btnFecharModalCancelar = document.getElementById('btnFecharModalCancelar');
    const btnConfirmarCancelar = document.getElementById('btnConfirmarCancelar');

    function fecharModal() {
        modalCancelar.classList.add('opacity-0', 'pointer-events-none');
        modalCancelar.querySelector('.transform').classList.add('scale-95');
    }

    btnAbrirModalCancelar.addEventListener('click', () => {
        modalCancelar.classList.remove('opacity-0', 'pointer-events-none');
        modalCancelar.querySelector('.transform').classList.remove('scale-95');
    });

    btnFecharModalCancelar.addEventListener('click', fecharModal);

    btnConfirmarCancelar.addEventListener('click', async () => {
        try {
            const response = await fetch(`http://localhost:3000/agendamentos/${agendamentoId}/cancelar`, { method: 'PUT' });
            const result = await response.json();

            if (result.success) {
                mostrarNotificacao('Consulta cancelada com sucesso.', 'sucesso');
                fecharModal();
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } else {
                mostrarNotificacao('Erro ao cancelar.', 'erro');
            }
        } catch (error) {
            mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
        }
    });

    protocoloSelect.addEventListener('change', async (e) => {
        if (atendimentoConcluido) return;

        const idSelecionado = e.target.value;

        if (!idSelecionado) {
            evolucaoTexto.value = '';
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/protocolos/${idSelecionado}`);
            const protocolo = await response.json();

            if (protocolo && protocolo.descricao_tratamento) {
                evolucaoTexto.value = protocolo.descricao_tratamento;
            }
        } catch (error) {
            mostrarNotificacao('Não foi possível carregar o modelo de protocolo.', 'erro');
        }
    });

    btnFinalizarEnviar.addEventListener('click', async () => {

        if (atendimentoConcluido) {
            window.location.href = 'dashboard.html';
            return;
        }

        const textoFinal = evolucaoTexto.value;

        if (!textoFinal.trim()) {
            mostrarNotificacao('Por favor, digite ou selecione a evolução clínica antes de enviar.', 'erro');
            return;
        }

        try {
            const responseStatus = await fetch(`http://localhost:3000/agendamentos/${agendamentoId}/finalizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ evolucao: textoFinal })
            });

            const resultStatus = await responseStatus.json();

            if (!resultStatus.success) {
                mostrarNotificacao('Erro ao salvar no banco.', 'erro');
                return;
            }

            mostrarNotificacao('Atendimento salvo! Abrindo o WhatsApp...', 'sucesso');

            let telefoneLimpo = telefoneTutor.replace(/\D/g, ''); 
            if (telefoneLimpo.length > 0 && !telefoneLimpo.startsWith('55')) {
                telefoneLimpo = '55' + telefoneLimpo; 
            }

            const mensagemFormatada = encodeURIComponent(`*Flidais - Resumo do Atendimento (${nomePet})*\n\n${textoFinal}`);
            
            setTimeout(() => {
                if (telefoneLimpo) {
                    window.open(`https://api.whatsapp.com/send?phone=${telefoneLimpo}&text=${mensagemFormatada}`, '_blank');
                } else {
                    alert('Atendimento salvo, mas o tutor não possui telefone cadastrado. Impossível enviar WhatsApp.');
                }
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            mostrarNotificacao('Erro ao conectar com o servidor para salvar evolução.', 'erro');
        }
    });
});