require('dotenv').config(); // Carga las variables de .env al inicio

const express = require('express');
const fs = require('fs');
const path = require('path');

function appendLog(obj) {
   try {
      const dir = path.join(__dirname, '..', 'logs');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, 'upload-errors.log');
      fs.appendFileSync(file, JSON.stringify(obj) + '\n');
   } catch (e) {
      console.error('Failed to write log file:', e);
   }
}
const cors = require('cors');
const documentRoutes = require('./api/routes/documentRoutes');
const authRoutes = require('./api/routes/authRoutes');
const searchRoutes = require('./api/routes/searchRoutes');
const datesRoutes = require('./api/routes/datesRoutes');

// --- Configuración Inicial ---
const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares ---
// Configuración CORS para el frontend desplegado
const corsOptions = {
   origin: process.env.FRONTEND_URL || [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://reliable-salmiakki-557968.netlify.app'
   ],
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Permite al servidor entender JSON con límite mayor
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Para parsear form data

// Health check endpoint
app.get('/health', (req, res) => {
   res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
   });
});

// --- Rutas de la API ---
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/dates', datesRoutes);

// --- Ruta de Prueba ---
app.get('/', (req, res) => {
   res.json({ 
      message: '¡El servidor del Gestor Documental Muni Inteligente está funcionando!',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
   });
});

// --- Manejo de errores ---
// Detecta errores comunes de Multer (tamaño excedido, demasiados archivos, tipo inesperado)
app.use((err, req, res, next) => {
   // Multer produce un objeto de error con name === 'MulterError' y propiedades `code`
    if (err && (err.name === 'MulterError' || err.code)) {
         console.error('Multer error:', err);
            const logEntry = {
               time: new Date().toISOString(),
               type: 'multer',
               name: err.name,
               code: err.code,
               message: err.message,
               stack: err.stack
            };
            appendLog(logEntry);
      // Mapear códigos comunes a mensajes legibles
      if (err.code === 'LIMIT_FILE_SIZE') {
         return res.status(413).json({ error: 'Archivo demasiado grande. Límite por archivo 10MB.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_PART_COUNT' || err.code === 'LIMIT_FILE_COUNT') {
         return res.status(400).json({ error: 'Demasiados archivos o formato inesperado en la subida.' });
      }
      // Fallback para otros errores de multer
      return res.status(400).json({ error: err.message || 'Error en la subida de archivos.' });
   }

    const logEntry = {
       time: new Date().toISOString(),
       type: 'error',
       message: err && err.message ? err.message : String(err),
       stack: err && err.stack ? err.stack : null
    };
    appendLog(logEntry);
    console.error(err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Iniciar el servidor
app.listen(port, () => {
   console.log(`Servidor escuchando en http://localhost:${port}`);
});