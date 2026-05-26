const express = require('express');
const router = express.Router();
const db = require('../db');
const { validarCadastroClinico } = require('../middleware/validation');

router.get('/pacientes-recorrentes', async (req, res, next) => {
    try {
        const { data, error } = await db.buscarPacientesRecorrentes();

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/api/galeria/pacientes', async (req, res, next) => {
    try {
        const { data, error } = await db.buscarPacientesComDetalhes();

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        next(error);
    }
});

router.post('/cadastro-clinico', validarCadastroClinico, async (req, res, next) => {
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
        agendaHorario,
        observacao
    } = req.body;

    try {
        const { data: novoTutor, error: errorTutor } = await db.criarTutor(tutorNome, tutorTelefone, tutorEmail);
        if (errorTutor) throw errorTutor;

        const { data: novoPet, error: errorPet } = await db.criarPaciente(
            novoTutor.id,
            petNome,
            petEspecie,
            petRaca,
            petPeso,
            petSexo
        );
        if (errorPet) throw errorPet;

        const { error: errorAgenda } = await db.criarAgendamento(
            novoPet.id,
            agendaData,
            agendaHorario,
            observacao
        );
        if (errorAgenda) throw errorAgenda;

        return res.json({ success: true, message: 'Fluxo de cadastro e agendamento concluído!' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
