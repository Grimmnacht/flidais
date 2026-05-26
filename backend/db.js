const { createClient } = require('@supabase/supabase-js');
const { TABLES, DEFAULT_USUARIO_ID, AGENDAMENTO_STATUS } = require('./constants');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const buscarUsuarioPorEmail = async (email) => {
    return await supabase
        .from(TABLES.USUARIOS)
        .select('*')
        .eq('email', email)
        .single();
};

const verificarEmailExistente = async (email) => {
    return await supabase
        .from(TABLES.USUARIOS)
        .select('id')
        .eq('email', email)
        .maybeSingle();
};

const criarUsuario = async (nome, email, senha) => {
    return await supabase
        .from(TABLES.USUARIOS)
        .insert([{ nome, email, senha }])
        .select('id, nome, email')
        .single();
};

const criarTutor = async (nome, telefone, email) => {
    return await supabase
        .from(TABLES.TUTORES)
        .insert([{ nome, telefone, email }])
        .select()
        .single();
};

const criarPaciente = async (tutor_id, nome, especie, raca, peso, sexo) => {
    return await supabase
        .from(TABLES.PACIENTES)
        .insert([{
            tutor_id,
            nome,
            especie,
            raca,
            peso: parseFloat(peso),
            sexo
        }])
        .select()
        .single();
};

const criarAgendamento = async (paciente_id, data_sessao, horario_sessao, observacao) => {
    return await supabase
        .from(TABLES.AGENDAMENTOS)
        .insert([{
            paciente_id,
            usuario_id: DEFAULT_USUARIO_ID,
            data_sessao,
            horario_sessao,
            status: AGENDAMENTO_STATUS.AGUARDANDO,
            observacao
        }]);
};

const buscarAgendamentos = async (dataFiltro) => {
    let query = supabase
        .from(TABLES.AGENDAMENTOS)
        .select(`
            id,
            horario_sessao,
            status,
            observacao,
            pacientes (
                nome,
                tutores (nome)
            )
        `)
        .neq('status', AGENDAMENTO_STATUS.CANCELADO);

    if (dataFiltro) {
        query = query.eq('data_sessao', dataFiltro);
    }

    return await query;
};

const buscarAgendamentoPorId = async (agendamentoId) => {
    return await supabase
        .from(TABLES.AGENDAMENTOS)
        .select(`
            id,
            status,
            evolucao_clinica,
            pacientes (
                nome,
                tutores (telefone)
            )
        `)
        .eq('id', agendamentoId)
        .single();
};

const atualizarStatusAgendamento = async (agendamentoId, status) => {
    return await supabase
        .from(TABLES.AGENDAMENTOS)
        .update({ status })
        .eq('id', agendamentoId)
        .select();
};

const finalizarAgendamento = async (agendamentoId, evolucao) => {
    return await supabase
        .from(TABLES.AGENDAMENTOS)
        .update({
            status: AGENDAMENTO_STATUS.REALIZADO,
            evolucao_clinica: evolucao
        })
        .eq('id', agendamentoId)
        .select();
};

const buscarPacientesRecorrentes = async () => {
    return await supabase
        .from(TABLES.PACIENTES)
        .select('id, nome, tutores ( nome )')
        .order('nome', { ascending: true });
};

const buscarPacientesComDetalhes = async () => {
    return await supabase
        .from(TABLES.PACIENTES)
        .select('id, nome, especie, raca, peso, sexo, tutores ( nome )')
        .order('nome', { ascending: true });
};

const buscarHistoricoAgendamentos = async (pacienteId) => {
    return await supabase
        .from(TABLES.AGENDAMENTOS)
        .select('id, data_sessao, horario_sessao, status, observacao, evolucao_clinica')
        .eq('paciente_id', pacienteId)
        .order('data_sessao', { ascending: false })
        .order('horario_sessao', { ascending: false });
};

const buscarProtocoloPorId = async (protocoloId) => {
    return await supabase
        .from(TABLES.PROTOCOLOS)
        .select('*')
        .eq('id', protocoloId)
        .single();
};

module.exports = {
    buscarUsuarioPorEmail,
    verificarEmailExistente,
    criarUsuario,
    criarTutor,
    criarPaciente,
    criarAgendamento,
    buscarAgendamentos,
    buscarAgendamentoPorId,
    atualizarStatusAgendamento,
    finalizarAgendamento,
    buscarPacientesRecorrentes,
    buscarPacientesComDetalhes,
    buscarHistoricoAgendamentos,
    buscarProtocoloPorId
};
