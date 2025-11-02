# 🚀 Muni Documental Backend

Backend API para el Gestor Documental Municipal Inteligente con capacidades de IA.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google AI](https://img.shields.io/badge/Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

## 🌟 Características

- **📄 API REST** para gestión de documentos
- **🔐 Autenticación JWT** con Supabase
- **🔍 Búsqueda semántica** con vectores de embeddings
- **🤖 IA integrada** para resúmenes automáticos
- **📊 Procesamiento de documentos** con Google Document AI
- **🛡️ Seguridad avanzada** con RLS y validaciones

## 🚀 Despliegue Rápido

### Railway (Recomendado)

1. Fork este repositorio
2. Conecta tu cuenta de Railway
3. Despliega desde GitHub
4. Configura las variables de entorno

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Variables de Entorno Requeridas

```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.com
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key
GOOGLE_CLOUD_PROJECT_ID=tu_project_id
GEMINI_API_KEY=tu_gemini_key
```

### Google Cloud Credentials

Para las credenciales de Google Cloud, tienes dos opciones:

#### Opción 1: Variable de entorno (Recomendado para Railway)
```env
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

#### Opción 2: Archivo de credenciales
Sube el archivo `gcp-credentials.json` al servidor.

## 🛠️ Desarrollo Local

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd muni-documental-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar en modo desarrollo
npm run dev
```

### Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm test           # Ejecutar tests (por implementar)
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/signup` - Registro de usuario
- `POST /api/auth/signin` - Inicio de sesión
- `POST /api/auth/signout` - Cerrar sesión

### Documentos
- `GET /api/documents` - Listar documentos
- `POST /api/documents/upload` - Subir documento
- `POST /api/documents/:id/summarize` - Generar resumen
- `DELETE /api/documents/:id` - Eliminar documento

### Búsqueda
- `GET /api/v1/search` - Búsqueda semántica

### Utilidades
- `GET /health` - Health check del servidor
- `GET /` - Información del servidor

## 🔧 Configuración de Servicios

### Supabase Setup

1. Crear proyecto en Supabase
2. Ejecutar las migraciones SQL (ver documentación)
3. Configurar Storage bucket `documents`
4. Habilitar RLS en las tablas

### Google Cloud Setup

1. Crear proyecto en Google Cloud Platform
2. Habilitar APIs:
   - Document AI API
   - Generative AI API
3. Crear cuenta de servicio
4. Descargar credenciales JSON

## 🚀 Plataformas de Despliegue Compatibles

- **Railway** ⭐ (Recomendado)
- **Heroku**
- **Google Cloud Run**
- **AWS Lambda** (con Serverless Framework)
- **DigitalOcean App Platform**
- **Vercel** (para APIs)

## 📊 Monitoreo

El servidor incluye:
- Health check endpoint `/health`
- Logging estructurado
- Manejo de errores centralizado
- Métricas de uptime

## 🔒 Seguridad

- Rate limiting en endpoints
- Validación de archivos
- Sanitización de inputs
- CORS configurado
- Headers de seguridad

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

¿Problemas con el despliegue? [Abrir un issue](../../issues)