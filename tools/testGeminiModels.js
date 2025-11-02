// Script para probar modelos disponibles en Gemini API
// Este script debe ejecutarse en el entorno donde están las variables de entorno (Railway)

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiModels() {
    console.log('🔍 Probando modelos disponibles en Gemini API...\n');
    
    // En Railway, las variables de entorno se inyectan automáticamente
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY no está configurada en las variables de entorno');
        console.error('ℹ️  Este script debe ejecutarse en el entorno de Railway donde están configuradas las variables');
        console.error('ℹ️  Variables de entorno disponibles:', Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('API')));
        return;
    }
    
    console.log('✅ GEMINI_API_KEY encontrada:', apiKey.substring(0, 20) + '...\n');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Lista de modelos que vamos a probar
    const modelsToTest = [
        'gemini-1.5-flash',
        'models/gemini-1.5-flash',
        'gemini-1.5-pro',
        'models/gemini-1.5-pro',
        'gemini-flash-latest',
        'models/gemini-flash-latest',
        'gemini-pro-latest',
        'models/gemini-pro-latest',
        'gemini-pro',
        'models/gemini-pro',
        'text-embedding-004',
        'models/text-embedding-004'
    ];
    
    console.log('🧪 Probando diferentes nombres de modelos...\n');
    
    for (const modelName of modelsToTest) {
        try {
            console.log(`📝 Probando modelo: ${modelName}`);
            
            // Para modelos de embedding
            if (modelName.includes('embedding')) {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.embedContent('test text');
                console.log(`   ✅ ${modelName} - FUNCIONA (embedding, dimensión: ${result.embedding.values.length})`);
            } else {
                // Para modelos generativos
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Di "hola" en español');
                const response = await result.response.text();
                console.log(`   ✅ ${modelName} - FUNCIONA (respuesta: ${response.substring(0, 50)}...)`);
            }
        } catch (error) {
            if (error.message.includes('model') || error.message.includes('not found') || error.message.includes('404')) {
                console.log(`   ❌ ${modelName} - NO DISPONIBLE (${error.message.split('\n')[0]})`);
            } else {
                console.log(`   ⚠️  ${modelName} - ERROR: ${error.message.split('\n')[0]}`);
            }
        }
        
        // Pequeña pausa entre requests para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🔍 Intentando listar todos los modelos disponibles...');
    
    try {
        // Intentar obtener la lista completa de modelos (si la API lo permite)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('\n📋 Modelos disponibles según la API:');
            
            if (data.models && data.models.length > 0) {
                data.models.forEach(model => {
                    console.log(`   - ${model.name} (${model.displayName || 'sin nombre'})`);
                    if (model.supportedGenerationMethods) {
                        console.log(`     Métodos: ${model.supportedGenerationMethods.join(', ')}`);
                    }
                });
            } else {
                console.log('   ℹ️  No se encontraron modelos en la respuesta');
            }
        } else {
            console.log(`   ❌ Error al obtener lista de modelos: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.log(`   ⚠️  Error al listar modelos: ${error.message}`);
    }
    
    console.log('\n🎯 Recomendaciones:');
    console.log('   - Usa los modelos que mostraron ✅ FUNCIONA');
    console.log('   - Los modelos con "models/" son nombres completos de la API');
    console.log('   - Los sin "models/" son nombres cortos/alias');
    console.log('   - Para embedding usa text-embedding-004');
    console.log('   - Para generación usa gemini-1.5-flash o gemini-1.5-pro');
}

// Ejecutar la prueba
testGeminiModels().catch(console.error);