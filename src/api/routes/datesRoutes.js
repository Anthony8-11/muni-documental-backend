const express = require('express');
const router = express.Router();
const datesController = require('../controllers/datesController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// GET /api/dates/important - Obtener fechas importantes
router.get('/important', datesController.getImportantDates);

// GET /api/dates/stats - Obtener estadísticas de fechas
router.get('/stats', datesController.getDatesStats);

module.exports = router;