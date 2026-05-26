const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/protocolos/:id', async (req, res, next) => {
    const { id: protocoloId } = req.params;

    try {
        const { data: protocolo, error } = await db.buscarProtocoloPorId(protocoloId);

        if (error) throw error;
        return res.json(protocolo);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
