const express = require('express');
const router = express.Router();
const db = require('../db');
const { validarLoginPayload, validarCriacaoUsuario } = require('../middleware/validation');

router.post('/login', validarLoginPayload, async (req, res, next) => {
    const { email, senha } = req.body;

    try {
        const { data: usuario, error } = await db.buscarUsuarioPorEmail(email);

        if (error || !usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        if (usuario.senha !== senha) {
            return res.status(401).json({
                success: false,
                message: 'Senha incorreta.'
            });
        }

        return res.json({
            success: true,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/usuarios', validarCriacaoUsuario, async (req, res, next) => {
    const { nome, email, senha } = req.body;

    try {
        const { data: usuarioExistente } = await db.verificarEmailExistente(email);

        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'Este e-mail já está em uso.'
            });
        }

        const { data: novoUsuario, error } = await db.criarUsuario(nome, email, senha);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Usuário criado com sucesso!',
            usuario: novoUsuario
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
