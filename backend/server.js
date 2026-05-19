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
    const { data: dataFiltro } = req.query;

    try {
        let query = supabase
            .from('agendamentos')
            .select(`
                id,
                horario_sessao,
                status,
                observacao,
                pacientes (
                    nome,
                    tutores (nome)
                )
            `);

        if (dataFiltro) {
            query = query.eq('data_sessao', dataFiltro);
        }

        const { data, error } = await query;

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
    const { 
        tutorNome, tutorTelefone, tutorEmail, 
        petNome, petEspecie, petRaca, petPeso, petSexo,
        agendaData, agendaHorario, observacao 
    } = req.body;

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
                peso: parseFloat(petPeso),
                sexo: petSexo
            }])
            .select()
            .single();

        if (errorPet) throw errorPet;

        const { error: errorAgenda } = await supabase
            .from('agendamentos')
            .insert([{
                paciente_id: novoPet.id,
                usuario_id: 1, 
                data_sessao: agendaData,
                horario_sessao: agendaHorario,
                status: 'Aguardando',
                observacao: observacao
            }]);

        if (errorAgenda) throw errorAgenda;

        return res.json({ success: true, message: 'Fluxo de cadastro e agendamento concluído!' });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/protocolos/:id', async (req, res) => {
    const ClintonId = req.params.id;

    try {
        const { data: protocolo, error } = await supabase
            .from('protocolos')
            .select('*')
            .eq('id', ClintonId)
            .single();

        if (error) throw error;
        return res.json(protocolo);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.put('/agendamentos/:id/confirmar', async (req, res) => {
    const agendamentoId = req.params.id;

    try {
        const { data, error } = await supabase
            .from('agendamentos')
            .update({ status: 'Confirmado' })
            .eq('id', agendamentoId)
            .select();

        if (error) throw error;

        return res.json({ success: true, message: 'Agendamento confirmado com sucesso!', data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/agendamentos/:id/finalizar', async (req, res) => {
    const agendamentoId = req.params.id;

    try {
        const { data, error } = await supabase
            .from('agendamentos')
            .update({ status: 'Realizado' })
            .eq('id', agendamentoId)
            .select();

        if (error) throw error;

        return res.json({ success: true, message: 'Status updated successfully!', data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/usuarios', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const { data: usuarioExistente } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (usuarioExistente) {
            return res.status(400).json({ success: false, message: 'Este e-mail já está em uso.' });
        }

        const { data: novoUsuario, error } = await supabase
            .from('usuarios')
            .insert([{ nome, email, senha }])
            .select('id, nome, email')
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Usuário criado com sucesso!',
            usuario: novoUsuario
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/pacientes-recorrentes', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('pacientes')
            .select(`
                id,
                nome,
                tutores (
                    nome
                )
            `)
            .order('nome', { ascending: true });

        if (error) throw error;
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/reconsulta', async (req, res) => {
    const { pacienteId, agendaData, agendaHorario, observacao } = req.body;

    try {
        const { error } = await supabase
            .from('agendamentos')
            .insert([{
                paciente_id: pacienteId,
                usuario_id: 1,
                data_sessao: agendaData,
                horario_sessao: agendaHorario,
                status: 'Aguardando',
                observacao: observacao
            }]);

        if (error) throw error;

        return res.json({ success: true, message: 'Reconsulta agendada com total sucesso!' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor do Flidais rodando na porta ${PORT}`);
});