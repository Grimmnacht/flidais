document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

    document.getElementById('btnVoltar').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    if (!agendamentoId) {
        alert('Nenhum atendimento selecionado.');
        window.location.href = 'dashboard.html';
        return;
    }

    const protocoloSelect = document.getElementById('protocoloSelect');
    const evolucaoTexto = document.getElementById('evolucaoTexto');

    protocoloSelect.addEventListener('change', async (e) => {
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
            console.error('Erro ao buscar protocolo:', error);
            alert('Não foi possível carregar o modelo de protocolo.');
        }
    });

    document.getElementById('btnFinalizarEnviar').addEventListener('click', async () => { // <-- ADICIONADO O ASYNC AQUI
        const textoFinal = evolucaoTexto.value;

        if (!textoFinal.trim()) {
            alert('Por favor, digite ou selecione um tratamento antes de enviar.');
            return;
        }

        try {

            const responseStatus = await fetch(`http://localhost:3000/agendamentos/${agendamentoId}/finalizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const resultStatus = await responseStatus.json();

            if (!resultStatus.success) {
                console.error('Aviso: Não foi possível atualizar o status no banco.');
            }

        } catch (error) {
            console.error('Erro ao conectar com o servidor para atualizar status:', error);
        }

        const telefoneTutor = "5531999999999"; 
        const mensagemFormatada = encodeURIComponent(`*Flidais - Resumo do Atendimento*\n\n${textoFinal}`);
        
        alert('Atendimento finalizado com sucesso! Abrindo o WhatsApp para envio...');
        
        window.open(`https://api.whatsapp.com/send?phone=${telefoneTutor}&text=${mensagemFormatada}`, '_blank');
        
        window.location.href = 'dashboard.html';
    });
});