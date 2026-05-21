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
            galeriaLista.innerHTML = '<p class="text-gray-400 text-center py-8">Nenhum paciente encontrado.</p>';
            return;
        }

        pacientes.forEach(pet => {
            const card = document.createElement('div');
            card.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 transition hover:shadow-md cursor-pointer border-l-4 border-l-emerald-600";
            
            const tutorNome = pet.tutores ? pet.tutores.nome : 'Não informado';
            const sexoBadge = pet.sexo === 'Macho' 
                ? '<span class="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-bold uppercase">Macho</span>'
                : '<span class="px-2 py-0.5 bg-pink-50 text-pink-600 border border-pink-100 rounded-md text-[10px] font-bold uppercase">Fêmea</span>';

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${pet.nome}</h3>
                        <p class="text-sm text-gray-400 font-medium">${pet.especie} • ${pet.raca}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1.5">
                        ${sexoBadge}
                        <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">${pet.peso ? pet.peso + ' kg' : '-- kg'}</span>
                    </div>
                </div>
                <div class="border-t border-gray-50 pt-2 flex flex-col gap-0.5">
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Responsável</span>
                    <span class="text-sm text-gray-600 font-medium">${tutorNome}</span>
                </div>
            `;

            card.addEventListener('click', () => carregarHistoricoPet(pet));

            galeriaLista.appendChild(card);
        });
    }

    try {
        const response = await fetch('http://localhost:3000/api/galeria/pacientes');
        todosPacientes = await response.json();
        renderPacientes(todosPacientes);
    } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        galeriaLista.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao conectar com a base de dados.</p>';
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
        timelineContainer.innerHTML = '<p class="text-gray-400 text-center py-4">Buscando prontuários passados...</p>';
        abrirModal();

        try {
            const response = await fetch(`http://localhost:3000/api/pacientes/${pet.id}/historico`);
            const historico = await response.json();

            timelineContainer.innerHTML = '';

            if (historico.length === 0) {
                timelineContainer.innerHTML = '<p class="text-gray-400 text-center py-4">Nenhum registro clínico encontrado para este paciente.</p>';
                return;
            }

            historico.forEach(sessao => {
                const dataFormatada = new Date(sessao.data_sessao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const itemTimeline = document.createElement('div');
                itemTimeline.className = "relative pl-6 border-l-2 border-gray-200 last:border-l-0 pb-2";

                itemTimeline.innerHTML = `
                    <div class="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white"></div>
                    <div class="flex justify-between items-baseline mb-1">
                        <span class="text-sm font-bold text-gray-800">${dataFormatada} às ${sessao.horario_sessao.slice(0, 5)}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            sessao.status === 'Realizado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }">${sessao.status}</span>
                    </div>
                    <p class="text-xs text-gray-500 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1.5 italic">
                        ${sessao.observacao ? `⚠️ ${sessao.observacao}` : 'Nenhuma observação interna anotada nesta consulta.'}
                    </p>
                `;
                timelineContainer.appendChild(itemTimeline);
            });

        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            timelineContainer.innerHTML = '<p class="text-red-500 text-center py-4">Não foi possível carregar o histórico clínico.</p>';
        }
    }
});