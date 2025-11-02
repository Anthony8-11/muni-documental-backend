// Script para probar modelos disponibles en Gemini API - Versión local
// Uso: node testGeminiModelsLocal.js YOUR_API_KEY_HERE

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiModels(apiKey) {
    console.log('🔍 Probando modelos disponibles en Gemini API...\n');
    
    if (!apiKey) {
        console.error('❌ Por favor proporciona tu API key como argumento:');
        console.error('   node testGeminiModelsLocal.js YOUR_API_KEY_HERE\n');
        return;
    }
    
    console.log('✅ Usando API key proporcionada:', apiKey.substring(0, 20) + '...\n');
    
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
    
    const workingModels = [];
    const failedModels = [];
    
    for (const modelName of modelsToTest) {
        try {
            console.log(`📝 Probando modelo: ${modelName}`);
            
            // Para modelos de embedding
            if (modelName.includes('embedding')) {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.embedContent('test text');
                const message = `✅ ${modelName} - FUNCIONA (embedding, dimensión: ${result.embedding.values.length})`;
                console.log(`   ${message}`);
                workingModels.push(modelName);
            } else {
                // Para modelos generativos
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Di "hola" en español');
                const response = await result.response.text();
                const message = `✅ ${modelName} - FUNCIONA (respuesta: ${response.substring(0, 50)}...)`;
                console.log(`   ${message}`);
                workingModels.push(modelName);
            }
        } catch (error) {
            const errorMsg = error.message.split('\n')[0];
            if (error.message.includes('model') || error.message.includes('not found') || error.message.includes('404')) {
                console.log(`   ❌ ${modelName} - NO DISPONIBLE (${errorMsg})`);
            } else {
                console.log(`   ⚠️  ${modelName} - ERROR: ${errorMsg}`);
            }
            failedModels.push({ model: modelName, error: errorMsg });
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
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE RESULTADOS:');
    console.log('='.repeat(60));
    
    console.log(`\n✅ MODELOS QUE FUNCIONAN (${workingModels.length}):`);
    workingModels.forEach(model => {
        console.log(`   - ${model}`);
    });
    
    console.log(`\n❌ MODELOS QUE NO FUNCIONAN (${failedModels.length}):`);
    failedModels.forEach(item => {
        console.log(`   - ${item.model}: ${item.error}`);
    });
    
    console.log('\n🎯 RECOMENDACIONES:');
    console.log('   - Para CHAT/RAG: usa uno de los modelos generativos que funcionan');
    console.log('   - Para EMBEDDING: usa text-embedding-004');
    console.log('   - Los modelos con "models/" son nombres completos de la API');
    console.log('   - Actualiza tu código para usar los modelos que funcionan ✅');
}

// Obtener API key del argumento de línea de comandos
const apiKey = process.argv[2];

// Ejecutar la prueba
testGeminiModels(apiKey).catch(console.error);