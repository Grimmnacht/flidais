document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

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

    let telefoneTutor = '';
    let nomePet = 'o Paciente';
    let atendimentoConcluido = false;

    try {
        const { ok, json } = await api.get(`/agendamentos/${agendamentoId}`);

        if (ok && json) {
            const dadosAgendamento = json;

            if (dadosAgendamento.pacientes) {
                nomePet = dadosAgendamento.pacientes.nome;
                telefoneTutor = dadosAgendamento.pacientes?.tutores?.telefone || '';
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
                btnFinalizarEnviar.className = 'w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2';
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

    const fecharModal = () => {
        modalCancelar.classList.add('opacity-0', 'pointer-events-none');
        modalCancelar.querySelector('.transform').classList.add('scale-95');
    };

    btnAbrirModalCancelar.addEventListener('click', () => {
        modalCancelar.classList.remove('opacity-0', 'pointer-events-none');
        modalCancelar.querySelector('.transform').classList.remove('scale-95');
    });

    btnFecharModalCancelar.addEventListener('click', fecharModal);

    btnConfirmarCancelar.addEventListener('click', async () => {
        try {
            const { ok, json } = await api.put(`/agendamentos/${agendamentoId}/cancelar`);

            if (ok && json && json.success) {
                mostrarNotificacao('Consulta cancelada com sucesso.', 'sucesso');
                fecharModal();
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
                return;
            }

            mostrarNotificacao('Erro ao cancelar.', 'erro');
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
            const { ok, json } = await api.get(`/protocolos/${idSelecionado}`);
            if (ok && json?.descricao_tratamento) {
                evolucaoTexto.value = json.descricao_tratamento;
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
            const { ok, json } = await api.put(`/agendamentos/${agendamentoId}/finalizar`, { evolucao: textoFinal });

            if (!ok || !json?.success) {
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