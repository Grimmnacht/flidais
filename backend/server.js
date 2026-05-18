const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
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

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !usuario) {
            return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
        }

        if (usuario.senha !== senha) {
            return res.status(401).json({ success: false, message: 'Senha incorreta.' });
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
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/cadastro-clinico', async (req, res) => {
    const { tutorNome, tutorTelefone, tutorEmail, petNome, petEspecie, petRaca, petPeso } = req.body;

    try {

        const { data: novoTutor, error: errorTutor } = await supabase
            .from('tutores')
            .insert([{ nome: tutorNome, telefone: tutorTelefone, email: tutorEmail }])
            .select()
            .single();

        if (errorTutor) throw errorTutor;

        const { data: novoPet, error: errorPet } = await supabase
            .from('pacientes')
            .insert([{
                tutor_id: novoTutor.id,
                nome: petNome,
                especie: petEspecie,
                raca: petRaca,
                peso: parseFloat(petPeso)
            }])
            .select()
            .single();

        if (errorPet) throw errorPet;

        return res.json({ success: true, message: 'Tutor e Paciente cadastrados com sucesso!' });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor do Flidais rodando na porta ${PORT}`);
});