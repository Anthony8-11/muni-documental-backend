const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;

// Initialize Document AI client
let clientConfig = {};

// Configuración para credenciales de Google Cloud
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Opción 1: Credenciales como JSON en variable de entorno (recomendado para despliegue)
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    clientConfig = { credentials };
  } catch (error) {
    console.error('Error parsing Google credentials JSON:', error);
    throw new Error('Invalid Google credentials JSON format');
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Opción 2: Archivo de credenciales (para desarrollo local)
  clientConfig = { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS };
} else {
  console.error('Google Cloud credentials not configured');
  throw new Error('Google Cloud credentials are required');
}

const documentAIClient = new DocumentProcessorServiceClient(clientConfig);

module.exports = documentAIClient;