const twSafelist = document.createElement('div');
twSafelist.className = "hidden dark:bg-zinc-800 dark:text-zinc-100 dark:text-zinc-500 dark:bg-zinc-700 dark:border-zinc-700/50 dark:text-zinc-300 dark:border-zinc-700 dark:bg-emerald-500 dark:ring-zinc-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 dark:bg-zinc-900/50 dark:text-zinc-400 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800/50 transition-colors dark:border-l-emerald-500";
document.body.appendChild(twSafelist);

document.addEventListener('DOMContentLoaded', async () => {
    const galeriaLista = document.getElementById('galeriaLista');
    const searchBar = document.getElementById('searchBar');
    const modalHistorico = document.getElementById('modalHistorico');
    const modalContent = modalHistorico.querySelector('.transform');
    
    let todosPacientes = [];

    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    document.getElementById('btnCloseModal').addEventListener('click', fecharModal);
    modalHistorico.addEventListener('click', (e) => {
        if (e.target === modalHistorico) fecharModal();
    });

    function abrirModal() {
        modalHistorico.classList.remove('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('translate-y-10');
    }

    function fecharModal() {
        modalHistorico.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('translate-y-10');
    }

    function renderPacientes(pacientes) {
        galeriaLista.innerHTML = '';

        if (pacientes.length === 0) {
            galeriaLista.innerHTML = '<p class="text-gray-400 dark:text-zinc-500 text-center py-8 transition-colors">Nenhum paciente encontrado.</p>';
            return;
        }

        pacientes.forEach(pet => {
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700/80 flex flex-col gap-3 transition-colors hover:shadow-md cursor-pointer border-l-4 border-l-emerald-600 dark:border-l-emerald-500";
            
            const tutorNome = pet.tutores ? pet.tutores.nome : 'Não informado';
            const sexoBadge = pet.sexo === 'Macho' 
                ? '<span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-md text-[10px] font-bold uppercase transition-colors">Macho</span>'
                : '<span class="px-2 py-0.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800/50 rounded-md text-[10px] font-bold uppercase transition-colors">Fêmea</span>';

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 dark:text-zinc-100 transition-colors">${pet.nome}</h3>
                        <p class="text-sm text-gray-400 dark:text-zinc-500 font-medium transition-colors">${pet.especie} • ${pet.raca}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1.5">
                        ${sexoBadge}
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded-md transition-colors">${pet.peso ? pet.peso + ' kg' : '-- kg'}</span>
                    </div>
                </div>
                <div class="border-t border-gray-50 dark:border-zinc-700/50 pt-2 flex flex-col gap-0.5 transition-colors">
                    <span class="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider transition-colors">Responsável</span>
                    <span class="text-sm text-gray-600 dark:text-zinc-300 font-medium transition-colors">${tutorNome}</span>
                </div>
            `;

            card.addEventListener('click', () => carregarHistoricoPet(pet));
            galeriaLista.appendChild(card);
        });
    }

    try {
        const { ok, json: data } = await api.get('/api/galeria/pacientes');
        if (!ok || !Array.isArray(data)) {
            throw new Error('Falha ao carregar pacientes');
        }

        todosPacientes = data;
        renderPacientes(todosPacientes);
    } catch (error) {
        galeriaLista.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center py-8">Erro ao conectar com a base de dados.</p>';
    }

    searchBar.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        const filtrados = todosPacientes.filter(pet => {
            const nomePet = pet.nome.toLowerCase();
            const especiePet = pet.especie.toLowerCase();
            const racaPet = pet.raca.toLowerCase();
            const nomeTutor = pet.tutores ? pet.tutores.nome.toLowerCase() : '';
            return nomePet.includes(termo) || especiePet.includes(termo) || racaPet.includes(termo) || nomeTutor.includes(termo);
        });
        renderPacientes(filtrados);
    });

    async function carregarHistoricoPet(pet) {
        document.getElementById('modalPetNome').textContent = pet.nome;
        document.getElementById('modalPetDetalhes').textContent = `${pet.especie} • ${pet.raca} (${pet.sexo || 'Sexo não informado'})`;
        
        const timelineContainer = document.getElementById('modalCorpoTimeline');
        timelineContainer.innerHTML = '<p class="text-gray-400 dark:text-zinc-500 text-center py-4 transition-colors">Buscando prontuários passados...</p>';
        abrirModal();

        try {
            const { ok, json: historico } = await api.get(`/api/pacientes/${pet.id}/historico`);

            timelineContainer.innerHTML = '';
            if (!ok || !Array.isArray(historico)) {
                throw new Error('Falha ao carregar histórico');
            }

            if (historico.length === 0) {
                timelineContainer.innerHTML = '<p class="text-gray-400 dark:text-zinc-500 text-center py-4 transition-colors">Nenhum registro clínico encontrado para este paciente.</p>';
                return;
            }

            historico.forEach(sessao => {
                const dataFormatada = new Date(sessao.data_sessao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const itemTimeline = document.createElement('div');
                itemTimeline.className = "relative pl-6 border-l-2 border-gray-200 dark:border-zinc-700 last:border-l-0 pb-2 transition-colors";

                itemTimeline.innerHTML = `
                    <div class="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-emerald-600 dark:bg-emerald-500 ring-4 ring-white dark:ring-zinc-800 transition-colors"></div>
                    <div class="flex justify-between items-baseline mb-1">
                        <span class="text-sm font-bold text-gray-800 dark:text-zinc-100 transition-colors">${dataFormatada} às ${sessao.horario_sessao.slice(0, 5)}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                            sessao.status === 'Realizado' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                        }">${sessao.status}</span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-700/50 mt-1.5 italic transition-colors">
                        ${sessao.observacao ? `⚠️ ${sessao.observacao}` : 'Nenhuma observação interna anotada nesta consulta.'}
                    </p>
                `;
                timelineContainer.appendChild(itemTimeline);
            });

        } catch (error) {
            timelineContainer.innerHTML = '<p class="text-red-500 dark:text-red-400 text-center py-4 transition-colors">Não foi possível carregar o histórico clínico.</p>';
        }
    }
});