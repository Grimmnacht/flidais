document.addEventListener('DOMContentLoaded', async () => {

    const usuarioLogado = JSON.stringify(sessionStorage.getItem('usuarioLogado'));
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
            card.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md cursor-pointer";

            const statusCor = agendamento.status === 'Aguardando' 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            card.innerHTML = `
                <div>
                    <div class="text-xl font-bold text-gray-800 mb-0.5">
                        ${agendamento.horario_sessao.slice(0, 5)} - ${agendamento.pacientes.nome}
                    </div>
                    <div class="text-sm text-gray-400 font-medium">
                        ${agendamento.pacientes.tutores ? agendamento.pacientes.tutores.nome : 'Tutor não informado'}
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusCor}">
                    ${agendamento.status}
                </span>
            `;

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
});