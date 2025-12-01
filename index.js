const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
const orderRoutes = require('./routes/order');

app.use('/order', orderRoutes);

// Health-check simples
app.get('/', (req, res) => res.json({ status: 'rodando', service: 'order-api' }));

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler 
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

app.listen(PORT, () => {
  console.log(`Order API rodando em http://localhost:${PORT}`);
});



