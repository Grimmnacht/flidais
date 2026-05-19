document.addEventListener('DOMContentLoaded', async () => {

    const vetData = JSON.parse(sessionStorage.getItem('usuarioLogado'));

    if (!vetData) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('vetName').textContent = `Dr(a). ${vetData.nome}`;

    const hoje = new Date();
    const opcoesData = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('currentDate').textContent = hoje.toLocaleDateString('pt-BR', opcoesData);

    const listaContainer = document.getElementById('agendaLista');

    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

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
        const dataHojeIso = hoje.toLocaleDateString('sv-SE');
        const response = await fetch(`http://localhost:3000/test-db?data=${dataHojeIso}`);
        const agendamentos = await response.json();

        listaContainer.innerHTML = '';

        if (agendamentos.length === 0) {
            listaContainer.innerHTML = `<p class="text-gray-400 text-center py-8">Nenhum atendimento agendado para hoje.</p>`;
            return;
        }

        agendamentos.forEach(agendamento => {
            const card = document.createElement('div');
            card.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md cursor-pointer relative overflow-hidden group";

            let statusCor = '';
            if (agendamento.status === 'Aguardando') {
                statusCor = 'bg-amber-50 text-amber-700 border-amber-200';
            } else if (agendamento.status === 'Confirmado') {
                statusCor = 'bg-blue-50 text-blue-700 border-blue-200';
            } else {
                statusCor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            }

            const botaoConfirmarHTML = agendamento.status === 'Aguardando'
                ? `<button class="btn-confirmar bg-blue-600 hover:bg-blue-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm transition transform active:scale-90 ml-3" title="Confirmar Presença">✓</button>`
                : '';

            const observacaoHTML = agendamento.observacao 
                ? `<div class="text-xs text-gray-500 italic mt-1.5 bg-gray-50 p-1.5 rounded-lg border border-gray-100 max-w-max">⚠️ Lembrete: ${agendamento.observacao}</div>` 
                : '';

            card.innerHTML = `
                <div class="flex-1">
                    <div class="text-xl font-bold text-gray-800 mb-0.5">
                        ${agendamento.horario_sessao.slice(0, 5)} - ${agendamento.pacientes.nome}
                    </div>
                    <div class="text-sm text-gray-400 font-medium">
                        ${agendamento.pacientes.tutores ? agendamento.pacientes.tutores.nome : 'Tutor não informado'}
                    </div>
                    ${observacaoHTML} 
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusCor}">
                        ${agendamento.status}
                    </span>
                    ${botaoConfirmarHTML}
                </div>
            `;

            if (agendamento.status === 'Aguardando') {
                const btnConfirmar = card.querySelector('.btn-confirmar');
                btnConfirmar.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    
                    try {
                        const responseConfirmar = await fetch(`http://localhost:3000/agendamentos/${agendamento.id}/confirmar`, {
                            method: 'PUT'
                        });
                        const result = await responseConfirmar.json();

                        if (result.success) {
                            mostrarNotificacao('Presença do paciente confirmada!', 'sucesso');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            mostrarNotificacao('Erro ao confirmar agendamento.', 'erro');
                        }
                    } catch (error) {
                        console.error('Erro na requisição:', error);
                        mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
                    }
                });
            }

            card.addEventListener('click', () => {
                window.location.href = `atendimento.html?id=${agendamento.id}`;
            });
            
            listaContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao buscar agenda:', error);
        listaContainer.innerHTML = `<p class="text-red-500 text-center py-8">Erro ao carregar a agenda.</p>`;
    }

    document.getElementById('btnNovoCadastro').addEventListener('click', () => {
        window.location.href = 'cadastro.html';
    });

    document.getElementById('btnReconsulta').addEventListener('click', () => {
        window.location.href = 'reconsulta.html';
    });
});