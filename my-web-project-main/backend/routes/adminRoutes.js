const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Routes protégées pour l'admin
router.get('/clients', verifyToken, isAdmin, adminController.getAllClients);
router.delete('/clients/:id', verifyToken, isAdmin, adminController.deleteClient);
router.delete('/projects/:id', verifyToken, isAdmin, adminController.deleteProject);

module.exports = router;