const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Import database connection
const { testConnection } = require('./config/database');

const app = express();
app.use(adminRoutes);

// CORRECTION: Middleware CORS pour les images
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(helmet({
  crossOriginResourcePolicy: false // IMPORTANT pour les images
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORRECTION: Servir les fichiers uploadés avec CORS
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Middleware pour headers CORS supplémentaires
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Headers spécifiques pour les images
  if (req.path.startsWith('/uploads/')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API fonctionne',
    timestamp: new Date().toISOString(),
    uploadsPath: path.join(__dirname, 'uploads')
  });
});

// Debug route pour voir les fichiers uploadés
app.get('/api/debug/uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads/projects');
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.json({
        success: false,
        message: 'Erreur lecture dossier uploads',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      count: files.length,
      files: files.map(file => ({
        name: file,
        path: `/uploads/projects/${file}`,
        url: `http://localhost:5000/uploads/projects/${file}`
      }))
    });
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('🔥 ERREUR GLOBALE:', err.message);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Vérifier le dossier uploads
    const uploadsDir = path.join(__dirname, 'uploads/projects');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Dossier uploads créé:', uploadsDir);
    }
    
    // Test connexion base de données
    console.log('🔗 Test connexion base de données...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Base de données non disponible');
      process.exit(1);
    }
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(` Serveur démarré sur http://localhost:${PORT}`);
      console.log(` Uploads: http://localhost:${PORT}/uploads/projects/`);
      console.log(` Debug: http://localhost:${PORT}/api/debug/uploads`);
      console.log(`  Projets: http://localhost:${PORT}/api/upload/projects`);
    });
    
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
}

// Import fs pour le debug
const fs = require('fs');
startServer();