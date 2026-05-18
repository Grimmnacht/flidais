const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
    res.send('API do Flidais rodando com sucesso!');
});

app.get('/test-db', async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('agendamentos')
            .select(`
                id,
                horario_sessao,
                status,
                pacientes (nome)
            `);

        if (error) throw error;

        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor do Flidais rodando na porta ${PORT}`);
});