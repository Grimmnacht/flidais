const twSafelist = document.createElement('div');
twSafelist.className = "hidden dark:bg-zinc-800 dark:border-zinc-700/80 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50 dark:bg-emerald-700 dark:border-emerald-800 dark:bg-red-700 dark:border-red-800 dark:hover:bg-blue-900/50 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-zinc-400 dark:bg-zinc-900/50 dark:border-zinc-700/50 dark:text-zinc-100 dark:text-zinc-500 transition-colors";
document.body.appendChild(twSafelist);

document.addEventListener('DOMContentLoaded', async () => {

    const btnNovoCadastro = document.getElementById('btnNovoCadastro');
    const btnReconsulta = document.getElementById('btnReconsulta');

    if (btnNovoCadastro) {
        btnNovoCadastro.addEventListener('click', () => {
            window.location.href = 'cadastro.html';
        });
    }

    if (btnReconsulta) {
        btnReconsulta.addEventListener('click', () => {
            window.location.href = 'reconsulta.html';
        });
    }

    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return;
    }
    const vetData = JSON.parse(usuarioLogado);
    document.getElementById('vetName').textContent = `Dr(a). ${vetData.nome}`;

    const hoje = new Date();
    const opcoesData = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('currentDate').textContent = hoje.toLocaleDateString('pt-BR', opcoesData);

    const listaContainer = document.getElementById('agendaLista');

    let agendamentoParaCancelar = null;
    const modalCancelar = document.getElementById('modalCancelar');
    const btnFecharModalCancelar = document.getElementById('btnFecharModalCancelar');
    const btnConfirmarCancelar = document.getElementById('btnConfirmarCancelar');

    function fecharModalCancelar() {
        agendamentoParaCancelar = null;
        modalCancelar.classList.add('opacity-0', 'pointer-events-none');
        modalCancelar.querySelector('.transform').classList.add('scale-95');
    }

    if (btnFecharModalCancelar) {
        btnFecharModalCancelar.addEventListener('click', fecharModalCancelar);
    }

    if (btnConfirmarCancelar) {
        btnConfirmarCancelar.addEventListener('click', async () => {
            if (!agendamentoParaCancelar) return;

            try {
                const response = await fetch(`http://localhost:3000/agendamentos/${agendamentoParaCancelar}/cancelar`, { method: 'PUT' });
                const result = await response.json();

                if (result.success) {
                    mostrarNotificacao('Agendamento cancelado com sucesso.', 'sucesso');
                    fecharModalCancelar();
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    mostrarNotificacao('Erro ao cancelar agendamento.', 'erro');
                }
            } catch (error) {
                console.error('Erro ao cancelar:', error);
                mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
            }
        });
    }

    function mostrarNotificacao(mensagem, tipo = 'sucesso') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        const cores = tipo === 'sucesso' 
            ? 'bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-700 dark:border-emerald-800' 
            : 'bg-red-600 dark:bg-red-700 text-white border-red-700 dark:border-red-800';

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

    try {
        const dataHojeIso = hoje.toLocaleDateString('sv-SE');
        const response = await fetch(`http://localhost:3000/test-db?data=${dataHojeIso}`);
        const agendamentos = await response.json();

        listaContainer.innerHTML = '';

        if (!agendamentos || agendamentos.length === 0) {
            listaContainer.innerHTML = `<p class="text-gray-400 dark:text-zinc-500 text-center py-8">Nenhum atendimento agendado para hoje.</p>`;
            return;
        }

        agendamentos.forEach(agendamento => {
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700/80 flex justify-between items-center transition-colors hover:shadow-md cursor-pointer relative overflow-hidden group";

            let statusCor = '';
            if (agendamento.status === 'Aguardando') {
                statusCor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50';
            } else if (agendamento.status === 'Confirmado') {
                statusCor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
            } else {
                statusCor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50';
            }

            const botaoConfirmarHTML = agendamento.status === 'Aguardando'
                ? `<button class="btn-confirmar bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400 dark:hover:bg-blue-900/50 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition transform active:scale-90" title="Confirmar Presença">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>
                   </button>`
                : '';

            const botaoCancelarHTML = (agendamento.status === 'Aguardando' || agendamento.status === 'Confirmado')
                ? `<button class="btn-cancelar bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/50 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition transform active:scale-90" title="Cancelar Agendamento">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                   </button>`
                : '';

            const observacaoHTML = agendamento.observacao 
                ? `<div class="text-xs text-gray-500 dark:text-zinc-400 italic mt-1.5 bg-gray-50 dark:bg-zinc-900/50 p-1.5 rounded-lg border border-gray-100 dark:border-zinc-700/50 max-w-max flex items-center gap-1 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                    Lembrete: ${agendamento.observacao}
                   </div>` 
                : '';

            const nomeTutor = (agendamento.pacientes && agendamento.pacientes.tutores) ? agendamento.pacientes.tutores.nome : 'Tutor não informado';
            const nomePet = agendamento.pacientes ? agendamento.pacientes.nome : 'Pet Desconhecido';

            card.innerHTML = `
                <div class="flex-1">
                    <div class="text-xl font-bold text-gray-800 dark:text-zinc-100 mb-0.5 transition-colors">
                        ${agendamento.horario_sessao.slice(0, 5)} - ${nomePet}
                    </div>
                    <div class="text-sm text-gray-400 dark:text-zinc-500 font-medium transition-colors">
                        ${nomeTutor}
                    </div>
                    ${observacaoHTML} 
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${statusCor}">
                        ${agendamento.status}
                    </span>
                    <div class="flex gap-1.5">
                        ${botaoConfirmarHTML}
                        ${botaoCancelarHTML}
                    </div>
                </div>
            `;

            if (agendamento.status === 'Aguardando') {
                const btnConfirmar = card.querySelector('.btn-confirmar');
                btnConfirmar.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    
                    try {
                        const responseConfirmar = await fetch(`http://localhost:3000/agendamentos/${agendamento.id}/confirmar`, { method: 'PUT' });
                        const result = await responseConfirmar.json();

                        if (result.success) {
                            mostrarNotificacao('Presença do paciente confirmada!', 'sucesso');
                            setTimeout(() => window.location.reload(), 1000);
                        } else {
                            mostrarNotificacao('Erro ao confirmar agendamento.', 'erro');
                        }
                    } catch (error) {
                        console.error('Erro na requisição:', error);
                        mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
                    }
                });
            }

            if (agendamento.status === 'Aguardando' || agendamento.status === 'Confirmado') {
                const btnCancelar = card.querySelector('.btn-cancelar');
                if (btnCancelar) {
                    btnCancelar.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        agendamentoParaCancelar = agendamento.id;
                        modalCancelar.classList.remove('opacity-0', 'pointer-events-none');
                        modalCancelar.querySelector('.transform').classList.remove('scale-95');
                    });
                }
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
});