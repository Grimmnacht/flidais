const express = require('express');
const router = express.Router();
const db = require('../db');
const { validarFinalizacaoAgendamento, validarReconsulta } = require('../middleware/validation');

router.get('/test-db', async (req, res, next) => {
    const { data: dataFiltro } = req.query;

    try {
        const { data, error } = await db.buscarAgendamentos(dataFiltro);

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/agendamentos/:id', async (req, res, next) => {
    const { id: agendamentoId } = req.params;

    try {
        const { data, error } = await db.buscarAgendamentoPorId(agendamentoId);

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.put('/agendamentos/:id/confirmar', async (req, res, next) => {
    const { id: agendamentoId } = req.params;

    try {
        const { data, error } = await db.atualizarStatusAgendamento(agendamentoId, 'Confirmado');

        if (error) throw error;
        return res.json({ success: true, message: 'Agendamento confirmado com sucesso!', data });
    } catch (error) {
        next(error);
    }
});

router.put('/agendamentos/:id/cancelar', async (req, res, next) => {
    const { id: agendamentoId } = req.params;

    try {
        const { data, error } = await db.atualizarStatusAgendamento(agendamentoId, 'Cancelado');

        if (error) throw error;
        return res.json({ success: true, message: 'Agendamento cancelado com sucesso!', data });
    } catch (error) {
        next(error);
    }
});

router.put('/agendamentos/:id/finalizar', validarFinalizacaoAgendamento, async (req, res, next) => {
    const { id: agendamentoId } = req.params;
    const { evolucao } = req.body;

    try {
        const { data, error } = await db.finalizarAgendamento(agendamentoId, evolucao);

        if (error) throw error;
        return res.json({ success: true, message: 'Status e evolução atualizados com sucesso!', data });
    } catch (error) {
        next(error);
    }
});

router.post('/reconsulta', validarReconsulta, async (req, res, next) => {
    const { pacienteId, agendaData, agendaHorario, observacao } = req.body;

    try {
        const { error } = await db.criarAgendamento(pacienteId, agendaData, agendaHorario, observacao);

        if (error) throw error;
        return res.json({ success: true, message: 'Reconsulta agendada com sucesso!' });
    } catch (error) {
        next(error);
    }
});

router.get('/api/pacientes/:id/historico', async (req, res, next) => {
    const { id: pacienteId } = req.params;

    try {
        const { data, error } = await db.buscarHistoricoAgendamentos(pacienteId);

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
