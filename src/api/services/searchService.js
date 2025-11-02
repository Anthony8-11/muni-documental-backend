const supabase = require('../../config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Using gemini-2.5-flash model for improved performance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function search(query) {
  // 1. Embed-Query
  const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const embedResult = await embeddingModel.embedContent(query);
  const queryVector = embedResult.embedding.values;

  // 2. Retrieve-Context (chunks should contain at least `content` and some document identifiers/metadata)
  const { data: chunks, error } = await supabase.rpc('match_documents', {
    query_embedding: queryVector,
    match_threshold: 0.5,
    match_count: 5
  });

  if (error) {
    throw new Error(`Error retrieving context: ${error.message}`);
  }

  // 3. Build-Prompt
  const contextText = (chunks || []).map(chunk => chunk.content).join('\n');
  const prompt = `Answer the question based only on the following context:\n\n${contextText}\n\nQuestion: ${query}\n\nAnswer:`;

  // 4. Generate-Response
  const generativeModel = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  const response = await generativeModel.generateContent(prompt);
  const answer = await response.response.text();

  // 5. Extract source document metadata from chunks
  // Be defensive: different RPC/DB setups may return different field names. We'll try common ones.
  const sourcesMap = new Map();
  (chunks || []).forEach((chunk, index) => {
    // Debug: Log what we're getting from each chunk
    console.log(`🔍 Chunk ${index}:`, {
      chunkId: chunk.id,
      metadata: chunk.metadata,
      document_id: chunk.document_id,
      doc_id: chunk.doc_id
    });
    
    // Prefer metadata fields if present (some pipelines store document id/name inside metadata JSON)
    const meta = chunk.metadata || (chunk.metadata === null ? null : undefined);
    const documentId = (meta && (meta.documentId || meta.document_id || meta.doc_id || meta.file_id)) || chunk.document_id || chunk.doc_id || chunk.document || chunk.source_id || chunk.file_id || null;
    const name = (meta && (meta.document_name || meta.file_name || meta.filename || meta.title)) || chunk.document_name || chunk.file_name || chunk.filename || chunk.source || chunk.title || null;
    const snippet = chunk.content || chunk.text || (meta && (meta.text || meta.content)) || null;
    const page = (meta && (meta.page || meta.page_number)) || chunk.page || chunk.page_number || null;
    const url = chunk.public_url || chunk.url || chunk.file_url || (meta && meta.public_url) || null;

    console.log(`📄 Extracted - Document ID: ${documentId}, Name: ${name}`);

    // Choose a key to dedupe sources; prioritize document name, then document id
    const key = documentId || name || `chunk-${chunk.id || Math.random().toString(36).slice(2,8)}`;

    if (!sourcesMap.has(key)) {
      sourcesMap.set(key, {
        id: documentId || null, // Use the actual document ID, not chunk ID
        name: name || 'Documento desconocido', // Changed: don't show doc-id format
        snippets: snippet ? [snippet] : [],
        page: page,
        url: url
      });
    } else {
      const entry = sourcesMap.get(key);
      if (snippet) entry.snippets.push(snippet);
    }
  });

  const sources = Array.from(sourcesMap.values());

  // Try to normalize each source to a document record in the DB when possible.
  // Do lookups in parallel to avoid serial DB calls.
  const normalizedPromises = sources.map(async (src) => {
    try {
      let found = null;

      // Primary strategy: Use the document ID we extracted from chunk metadata
      if (src.id) {
        console.log(`🔍 Looking for document with ID: ${src.id}`);
        const { data: doc, error: docErr } = await supabase
          .from('documents')
          .select('id, file_name, storage_path')
          .eq('id', src.id)
          .maybeSingle();
        
        if (!docErr && doc) {
          found = doc;
          console.log(`✅ Found document directly: ${doc.file_name}`);
        } else {
          console.log(`❌ Document lookup failed for ID ${src.id}:`, docErr?.message || 'No document found');
        }
      }

      // Fallback: If we have a name, try matching by file_name
      if (!found && src.name && src.name !== 'Documento desconocido') {
        console.log(`🔍 Trying name-based search for: ${src.name}`);
        // Try exact match first
        const { data: exact, error: exactErr } = await supabase
          .from('documents')
          .select('id, file_name, storage_path')
          .eq('file_name', src.name)
          .limit(1);
        if (!exactErr && exact && exact.length > 0) {
          found = exact[0];
          console.log(`✅ Found document by name: ${found.file_name}`);
        }
      }

      if (found) {
        // Always use the canonical document name from database
        src.id = found.id;
        src.name = found.file_name; // Always use DB file_name, not fallback
        src.storage_path = found.storage_path || null;
        console.log(`✅ Found document: ${found.file_name} for source ID: ${src.id}`);

        // Try to obtain a public URL if possible
        try {
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(found.storage_path);
          if (urlData && urlData.publicUrl) src.url = urlData.publicUrl;
        } catch (e) {
          // ignore storage errors; we still return the normalized id/name
        }
      } else {
        console.log(`❌ No document found for source ID: ${src.id}, name: ${src.name}`);
        
        // If no document found in DB, but we have a name from chunk, use it
        if (src.name && src.name !== 'Documento desconocido') {
          // Keep the name from chunk metadata if available
        } else {
          // Last fallback if no name available anywhere
          src.name = `Documento ${src.id || 'sin identificar'}`;
        }
      }

      return src;
    } catch (err) {
      // If any lookup fails, return the original src silently
      console.warn('Error normalizing source:', err.message || err);
      return src;
    }
  });

  const normalized = await Promise.all(normalizedPromises);

  return { answer, sources: normalized };
}

module.exports = {
  search
};