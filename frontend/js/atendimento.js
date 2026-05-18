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

    document.getElementById('btnFinalizarEnviar').addEventListener('click', () => {
        const textoFinal = evolucaoTexto.value;

        if (!textoFinal.trim()) {
            alert('Por favor, digite ou selecione um tratamento antes de enviar.');
            return;
        }

        const telefoneTutor = "5531999999999";
        const mensagemFormatada = encodeURIComponent(`*Flidais - Resumo do Atendimento*\n\n${textoFinal}`);
        
        alert('Atendimento finalizado com sucesso! Abrindo o WhatsApp para envio...');

        window.open(`https://api.whatsapp.com/send?phone=${telefoneTutor}&text=${mensagemFormatada}`, '_blank');

        window.location.href = 'dashboard.html';
    });
});