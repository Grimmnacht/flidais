const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const pacientesRoutes = require('./routes/pacientes');
const agendamentosRoutes = require('./routes/agendamentos');
const protocolosRoutes = require('./routes/protocolos');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API do Flidais rodando com sucesso!');
});

app.use('/', authRoutes);
app.use('/', pacientesRoutes);
app.use('/', agendamentosRoutes);
app.use('/', protocolosRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor do Flidais rodando na porta ${PORT}`);
});