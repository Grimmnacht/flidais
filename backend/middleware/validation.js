const validarLoginPayload = (req, res, next) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            success: false,
            message: 'E-mail e senha são obrigatórios.'
        });
    }

    next();
};

const validarCriacaoUsuario = (req, res, next) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({
            success: false,
            message: 'Nome, e-mail e senha são obrigatórios.'
        });
    }

    next();
};

const validarCadastroClinico = (req, res, next) => {
    const {
        tutorNome,
        tutorTelefone,
        tutorEmail,
        petNome,
        petEspecie,
        petRaca,
        petPeso,
        petSexo,
        agendaData,
        agendaHorario
    } = req.body;

    if (!tutorNome || !tutorTelefone || !tutorEmail ||
        !petNome || !petEspecie || !petRaca || !petPeso || !petSexo ||
        !agendaData || !agendaHorario) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos obrigatórios devem ser preenchidos.'
        });
    }

    next();
};

const validarReconsulta = (req, res, next) => {
    const { pacienteId, agendaData, agendaHorario } = req.body;

    if (!pacienteId || !agendaData || !agendaHorario) {
        return res.status(400).json({
            success: false,
            message: 'ID do paciente, data e horário são obrigatórios.'
        });
    }

    next();
};

const validarFinalizacaoAgendamento = (req, res, next) => {
    const { evolucao } = req.body;

    if (!evolucao || !evolucao.toString().trim()) {
        return res.status(400).json({
            success: false,
            message: 'Evolução clínica é obrigatória.'
        });
    }

    next();
};

module.exports = {
    validarLoginPayload,
    validarCriacaoUsuario,
    validarCadastroClinico,
    validarReconsulta,
    validarFinalizacaoAgendamento
};
