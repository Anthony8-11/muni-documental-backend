// Script simple para hacer una prueba básica del modelo actual
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testCurrentModels() {
    console.log('🧪 Probando los modelos actualmente configurados en el sistema...\n');
    
    // Simular las variables de entorno de Railway (estas se configuran allá)
    const apiKey = process.env.GEMINI_API_KEY || 'NO_KEY_FOUND';
    
    if (apiKey === 'NO_KEY_FOUND') {
        console.log('ℹ️  Este script mostrará los modelos que estás usando actualmente en el código:');
        console.log('');
        console.log('📁 En searchService.js:');
        console.log('   - Embedding: text-embedding-004');
        console.log('   - Generativo: models/gemini-flash-latest');
        console.log('');
        console.log('📁 En documentService.js:');
        console.log('   - Generativo: models/gemini-flash-latest');
        console.log('');
        console.log('🔧 Para probar si estos modelos funcionan con tu API key:');
        console.log('   1. Obtén tu GEMINI_API_KEY de Google AI Studio');
        console.log('   2. Ejecuta: node testGeminiModelsLocal.js TU_API_KEY_AQUI');
        console.log('');
        console.log('🚀 En Railway, estos modelos se probarán automáticamente cuando');
        console.log('   los usuarios usen las funciones de chat RAG y resumen de documentos.');
        console.log('');
        console.log('💡 Si hay errores 404 en Railway, significa que el modelo no existe');
        console.log('   y necesitas cambiarlo por uno que sí funcione.');
        
        return;
    }
    
    // Si tenemos API key, hacer una prueba real
    console.log('✅ Encontré GEMINI_API_KEY, probando modelos reales...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
        console.log('\n📝 Probando modelo de embedding: text-embedding-004');
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const embedResult = await embeddingModel.embedContent('texto de prueba');
        console.log(`   ✅ text-embedding-004 funciona (dimensión: ${embedResult.embedding.values.length})`);
    } catch (error) {
        console.log(`   ❌ text-embedding-004 falló: ${error.message}`);
    }
    
    try {
        console.log('\n📝 Probando modelo generativo: models/gemini-flash-latest');
        const generativeModel = genAI.getGenerativeModel({ model: 'models/gemini-flash-latest' });
        const result = await generativeModel.generateContent('Di "hola" en español');
        const response = await result.response.text();
        console.log(`   ✅ models/gemini-flash-latest funciona: ${response}`);
    } catch (error) {
        console.log(`   ❌ models/gemini-flash-latest falló: ${error.message}`);
    }
}

testCurrentModels().catch(console.error);