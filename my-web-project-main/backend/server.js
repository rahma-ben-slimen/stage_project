const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes'); // AJOUTER
const { testConnection } = require('./config/database');

dotenv.config();

const app = express();

// CORS configuré pour le frontend sur le port 4200
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes); // AJOUTER

// Test routes
app.get('/', (req, res) => {
  res.json({
    message: 'API Sadraoui Construction',
    version: '1.0.0'
  });
});

app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'OK',
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('🔄 Connexion à la base de données...');
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.log('❌ Base de données non connectée');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`=====================================`);
    console.log(`🚀 Backend: http://localhost:${PORT}`);
    console.log(`🌐 Frontend: http://localhost:4200`);
    console.log(`=====================================`);
  });
};

startServer();