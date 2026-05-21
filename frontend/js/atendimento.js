document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

    // Função de Toasts Customizados
    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        const cores = tipo === 'sucesso' 
            ? 'bg-emerald-600 text-white border-emerald-700' 
            : 'bg-red-600 text-white border-red-700';
        toast.className = `${cores} px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 transition duration-300 transform translate-x-20 opacity-0 pointer-events-auto`;
        toast.innerHTML = `<span>${tipo === 'sucesso' ? '✨' : '⚠️'}</span> <span>${mensagem}</span>`;
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

            if (dadosAgendamento.status === 'Realizado') {
                atendimentoConcluido = true;

                document.getElementById('atendimentoTitulo').textContent = `Prontuário Fechado: ${nomePet}`;
                evolucaoTexto.value = dadosAgendamento.evolucao_clinica || 'Nenhum histórico registrado.';

                evolucaoTexto.readOnly = true;
                evolucaoTexto.classList.add('bg-gray-100', 'cursor-not-allowed', 'text-gray-500');
                protocoloSelect.disabled = true;
                protocoloSelect.classList.add('bg-gray-100', 'cursor-not-allowed');

                btnFinalizarEnviar.innerHTML = `<span>←</span> Atendimento Concluído (Voltar)`;
                btnFinalizarEnviar.className = "w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4";
            } else {
                document.getElementById('atendimentoTitulo').textContent = `Atendendo: ${nomePet}`;
            }
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do paciente:', error);
    }

    protocoloSelect.addEventListener('change', async (e) => {
        if (atendimentoConcluido) return; // Proteção extra

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