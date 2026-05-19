document.addEventListener('DOMContentLoaded', () => {
 
    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

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
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const sexoSelecionado = document.querySelector('input[name="petSexo"]:checked')?.value;

        const dadosFormulario = {
            petNome: document.getElementById('petNome').value,
            petEspecie: document.getElementById('petEspecie').value,
            petRaca: document.getElementById('petRaca').value,
            petPeso: document.getElementById('petPeso').value,
            petSexo: sexoSelecionado,
            tutorNome: document.getElementById('tutorNome').value,
            tutorTelefone: document.getElementById('tutorTelefone').value,
            tutorEmail: document.getElementById('tutorEmail').value,
            agendaData: document.getElementById('agendamentoData').value,
            agendaHorario: document.getElementById('agendamentoHorario').value,
            observacao: document.getElementById('observacao').value
        };

        try {
            const response = await fetch('http://localhost:3000/cadastro-clinico', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosFormulario)
            });

            const result = await response.json();

            if (result.success) {

                mostrarNotificacao('Cadastro realizado com sucesso!', 'sucesso');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                mostrarNotificacao('Erro ao realizar cadastro: ' + result.error, 'erro');
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            mostrarNotificacao('Não foi possível conectar ao servidor.', 'erro');
        }
    });
});