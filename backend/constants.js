const AGENDAMENTO_STATUS = {
    AGUARDANDO: 'Aguardando',
    CONFIRMADO: 'Confirmado',
    CANCELADO: 'Cancelado',
    REALIZADO: 'Realizado'
};

const TABLES = {
    USUARIOS: 'usuarios',
    TUTORES: 'tutores',
    PACIENTES: 'pacientes',
    AGENDAMENTOS: 'agendamentos',
    PROTOCOLOS: 'protocolos'
};

const DEFAULT_USUARIO_ID = 1;

module.exports = {
    AGENDAMENTO_STATUS,
    TABLES,
    DEFAULT_USUARIO_ID
};
