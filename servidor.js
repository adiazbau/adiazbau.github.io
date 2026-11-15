require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises; 
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Variables globales de datos
let manualJson = [];
let indiceJson = [];
let digestoJson = []; 

// --- 1. CACHÉ ESTÁTICA (MODO DEMO) ---
const DEMO_CACHE = {
    "hurto": {
        es_chat: true,
        json: {
            respuesta_principal: "**DEFINICIÓN JURÍDICA:**\nEl hurto (*Furtum*) es el manejo fraudulento de una cosa (*contrectatio*) con ánimo de lucro, ya sea de la propia cosa, de su uso o de su posesión.\n\n**ELEMENTOS CLAVE:**\n1. **Contrectatio:** No se exige el desplazamiento físico, basta con tocar o manejar indebidamente.\n2. **Animus Furandi:** La intención subjetiva de robar.\n3. **Invito Domino:** Debe hacerse contra la voluntad del dueño.",
            conexion_moderna: "En la actualidad, el hurto está tipificado en el Código Penal (arts. 234 y ss.) y se distingue del robo por la ausencia de fuerza en las cosas o violencia en las personas."
        },
        respuesta: "SENTENCIA: CONDENO al demandado. Ha quedado probado el elemento objetivo (contrectatio) y el subjetivo (animus furandi)."
    },
    "posesion": {
        es_chat: true,
        json: {
            respuesta_principal: "La posesión (*possessio*) es una situación de hecho (*res facti*), consistente en la tenencia material de una cosa. \n\n**SOBRE LA PROTECCIÓN:** Los interdictos protegen a **cualquier poseedor**, ya sea civil (*ad usucapionem*) o natural. La protección se concede al hecho de la posesión para mantener la paz social.\n\n**LA EXCEPCIÓN (DETENTADORES):** Existen ciertos tenedores, llamados **detentadores** (como el arrendatario o el depositario), a los que, por razones históricas o socioeconómicas, no se les reconoce la cualidad de poseedores y, por tanto, **carecen de protección interdictal** propia (deben recurrir al dueño).",
            conexion_moderna: "Este principio se mantiene en la actualidad: todo poseedor tiene derecho a ser respetado en su posesión (Art. 446 del Código Civil) y existen procedimientos sumarios para su defensa."
        }
    },
    "mancipatio": {
        es_chat: true,
        json: {
            respuesta_principal: "La Mancipatio es el modo solemne y arcaico de adquirir la propiedad civil (*dominium*) de las *res mancipi*.\n\n**RITO:** Es un negocio *per aes et libram* (por el cobre y la balanza). Requiere la presencia del transmitente y el adquirente, 5 testigos ciudadanos romanos púberes, el *libripens* (portabalanzas) y la pronunciación de palabras solemnes (*nuncupatio*).\n\n**EFECTO:** Transfiere la propiedad y genera la obligación de **Auctoritas** (garantía): el transmitente debe defender al adquirente si un tercero reclama la cosa.",
            conexion_moderna: "Es el antecedente histórico de las formalidades actuales y de la obligación de saneamiento por evicción."
        }
    },
    "usucapion": {
        es_chat: true,
        json: {
            respuesta_principal: "La Usucapio es la adquisición del dominio por la posesión continuada durante el tiempo fijado por la ley.\n\n**REQUISITOS CLÁSICOS:**\n1. **Res habilis:** Cosa idónea (no robada - *res furtiva*).\n2. **Titulus:** Causa justa (compraventa, donación) que justifica la toma de posesión.\n3. **Fides:** Buena fe inicial (creencia de no lesionar derecho ajeno).\n4. **Possessio:** Tenencia material con ánimo de dueño.\n5. **Tempus:** Plazo legal (XII Tablas: 1 año muebles, 2 inmuebles; Justiniano amplía los plazos).",
            conexion_moderna: "Equivale a la prescripción adquisitiva del Código Civil actual (Arts. 1930 y ss.), aunque con plazos mucho más largos."
        }
    }
};

// --- 2. CACHÉ DINÁMICA (LRU) ---
const MEMORIA_DINAMICA = new Map(); 
const MAX_MEMORIA_ITEMS = 50; 

function guardarEnMemoria(key, valor) {
    if (MEMORIA_DINAMICA.has(key)) {
        MEMORIA_DINAMICA.delete(key);
    } else if (MEMORIA_DINAMICA.size >= MAX_MEMORIA_ITEMS) {
        const oldestKey = MEMORIA_DINAMICA.keys().next().value;
        MEMORIA_DINAMICA.delete(oldestKey);
    }
    MEMORIA_DINAMICA.set(key, valor);
}

function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// --- CONFIGURACIÓN ---
// SOLUCIÓN CORS: Permite acceso a cualquier dominio (*). La más efectiva para evitar bloqueos.
app.use(cors({
    origin: '*', 
    methods: ['POST', 'GET', 'OPTIONS'], // Añadido OPTIONS para las peticiones preflight
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: "1mb" }));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",           
                "https://cdn.tailwindcss.com",
                "https://ajax.googleapis.com",
                "https://fonts.googleapis.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com"
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: [
                "'self'",
                "https://derechoromano-ecma.onrender.com",
                "https://generativelanguage.googleapis.com"
            ],
            imgSrc: ["'self'", "data:"],
            mediaSrc: ["'self'"]
        }
    }
}));
app.set('trust proxy', 1);

app.use(express.static(__dirname));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 40, // máximo 40 peticiones por ventana (suficiente para uso académico normal)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas peticiones. Por favor, espera unos minutos.' }
});
app.use('/api/', limiter);

// --- UTILIDADES ---
function handleApiError(error, res) {
    // Registrar el motivo devuelto por Google sin exponer claves, cabeceras ni prompts.
    // Nunca registrar error.config: Axios puede incluir la clave API en su URL.
    const status = error.response?.status ?? null;
    const providerError = error.response?.data?.error;
    const providerMessage = typeof providerError?.message === 'string'
        ? providerError.message
        : (typeof error.message === 'string' ? error.message : 'Error desconocido');
    const safeMessage = providerMessage
        .replace(/([?&]key=)[^&\s]+/gi, '$1[OCULTA]')
        .replace(/(AIza)[A-Za-z0-9_-]+/g, '[CLAVE OCULTA]')
        .replace(/sk-[A-Za-z0-9_-]+/g, '[CLAVE OCULTA]')
        .slice(0, 600);

    console.error('[Gemini API]', {
        httpStatus: status,
        providerStatus: typeof providerError?.status === 'string' ? providerError.status : null,
        errorCode: typeof providerError?.code === 'number' ? providerError.code : null,
        message: safeMessage,
        networkCode: error.code || null
    });

    // Mantener la respuesta pública genérica, sin datos internos del proveedor.
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error del sistema.' });
}

function limpiarYParsearJSON(texto) {
    if (typeof texto === 'object') return texto;
    try {
        return JSON.parse(texto);
    } catch (e) {
        try {
            const match = texto.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        } catch (e2) {}
        return {
            respuesta_principal: texto.replace(/["{}]/g, ""), 
            conexion_moderna: "Consulta el Código Civil vigente."
        };
    }
}

// --- PROVEEDORES DE IA Y CONTADOR DE CONSUMO ---
// Variables de Render (nunca incluir sus valores en GitHub):
// AI_PROVIDER=gemini|openai, AI_FALLBACK_ENABLED=false|true
// OPENAI_API_KEY (opcional), OPENAI_MODEL=gpt-5.4-mini
// GEMINI_API_KEY (existente), GEMINI_MODEL=gemini-3.1-pro-preview
// ADMIN_STATS_TOKEN (opcional; protege la consulta privada de estadísticas).
const crypto = require('crypto');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.4-mini';
const PRIMARY_PROVIDER = process.env.AI_PROVIDER === 'openai' ? 'openai' : 'gemini';
const FALLBACK_ENABLED = process.env.AI_FALLBACK_ENABLED === 'true';
const startedAt = new Date().toISOString();
const usageMonths = Object.create(null);

// Precios orientativos USD por millón de tokens de texto; actualizar si cambian.
// Se computan las unidades que declara cada API, no una aproximación de caracteres.
const UNIT_PRICES = Object.freeze({
    'gemini-3.1-pro-preview': { input: 2.00, output: 12.00 },
    'gpt-5.4-mini': { input: 0.75, cachedInput: 0.075, output: 4.50 }
});

function saveUsage({ provider, model, feature, usage }) {
    const input = Math.max(0, Number(usage.inputTokens) || 0);
    const output = Math.max(0, Number(usage.outputTokens) || 0);
    const cached = Math.min(input, Math.max(0, Number(usage.cachedTokens) || 0));
    const price = UNIT_PRICES[model];
    const estimatedUsd = price
        ? ((input - cached) * price.input +
           cached * (price.cachedInput ?? price.input) +
           output * price.output) / 1_000_000
        : null;
    const month = new Date().toISOString().slice(0, 7);
    if (!usageMonths[month]) usageMonths[month] = { requests: 0, inputTokens: 0, outputTokens: 0, estimatedUsd: 0, breakdown: {} };
    const total = usageMonths[month];
    const key = provider + ':' + model + ':' + feature;
    if (!total.breakdown[key]) total.breakdown[key] = { requests: 0, inputTokens: 0, outputTokens: 0, estimatedUsd: 0 };
    for (const item of [total, total.breakdown[key]]) {
        item.requests += 1;
        item.inputTokens += input;
        item.outputTokens += output;
        if (estimatedUsd !== null) item.estimatedUsd += estimatedUsd;
    }
    // Render conserva registros según su plan; ningún texto del usuario se registra aquí.
    console.log('[AI_USAGE]', JSON.stringify({
        month, provider, model, feature, inputTokens: input, outputTokens: output,
        estimatedUsd: estimatedUsd === null ? null : Number(estimatedUsd.toFixed(8))
    }));
}

function validAdminToken(req) {
    const expected = process.env.ADMIN_STATS_TOKEN;
    const received = req.get('x-admin-token');
    if (!expected || !received) return false;
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Uso privado del profesor: no publicar ADMIN_STATS_TOKEN en index.html.
// NOTA: cifras en memoria desde el último reinicio de Render; los registros
// [AI_USAGE] permiten consultar el histórico sujeto a retención de Render.
app.get('/api/admin/usage', (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!validAdminToken(req)) return res.status(403).json({ error: 'FORBIDDEN' });
    res.json({ startedAt, ephemeral: true, currency: 'USD', estimate: true, months: usageMonths });
});

async function callGemini(payload, feature) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY no está configurada en Render');
    const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(GEMINI_MODEL) + ':generateContent',
        payload,
        { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, timeout: 30000 }
    );
    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const text = parts.map(part => part.text || '').join('').trim();
    if (!text) throw new Error('Gemini devolvió una respuesta vacía');
    const usage = response.data?.usageMetadata || {};
    saveUsage({
        provider: 'gemini', model: GEMINI_MODEL, feature,
        usage: {
            inputTokens: usage.promptTokenCount,
            outputTokens: (usage.candidatesTokenCount || 0) + (usage.thoughtsTokenCount || 0),
            cachedTokens: 0 // Tarifa estándar conservadora
        }
    });
    return text;
}

async function callOpenAI(payload, feature) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY no está configurada en Render');
    const prompt = payload.contents?.flatMap(c => c.parts || []).map(p => p.text || '').join('\n') || '';
    const response = await axios.post('https://api.openai.com/v1/responses', {
        model: OPENAI_MODEL,
        input: prompt,
        store: false,
        max_output_tokens: 4000,
        reasoning: { effort: 'none' }
    }, {
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        timeout: 45000
    });
    const output = response.data?.output || [];
    const text = output.flatMap(item => item.content || [])
        .filter(part => part.type === 'output_text')
        .map(part => part.text || '').join('\n').trim();
    if (!text) throw new Error('OpenAI devolvió una respuesta vacía');
    const usage = response.data?.usage || {};
    saveUsage({
        provider: 'openai', model: OPENAI_MODEL, feature,
        usage: {
            inputTokens: usage.input_tokens,
            outputTokens: usage.output_tokens,
            cachedTokens: usage.input_tokens_details?.cached_tokens
        }
    });
    return text;
}

// Conservamos el nombre original para no modificar el contrato de los endpoints.
async function callGeminiWithRetries(payload, feature = 'general') {
    const first = PRIMARY_PROVIDER;
    const second = first === 'gemini' ? 'openai' : 'gemini';
    const call = name => name === 'gemini' ? callGemini(payload, feature) : callOpenAI(payload, feature);
    try {
        return await call(first);
    } catch (error) {
        const status = error.response?.status;
        const canFallback = FALLBACK_ENABLED &&
            (status === 402 || status === 429 || status >= 500) &&
            (second === 'openai' ? Boolean(process.env.OPENAI_API_KEY) : Boolean(process.env.GEMINI_API_KEY));
        if (!canFallback) throw error;
        console.warn('[AI_FALLBACK]', JSON.stringify({ from: first, to: second, status }));
        return await call(second);
    }
}

// --- BÚSQUEDA ---
function getContextoRelevante(termino) {
    if (!termino || !manualJson.length) return '';
    const termClean = normalizarTexto(termino);
    const tokens = termClean.split(/\s+/).filter(t => t.length > 3);
    if (tokens.length === 0) tokens.push(termClean);

    if (termClean.includes('posesion')) {
        return `MANUAL: La posesión es un hecho protegido por interdictos. La protección abarca a cualquier poseedor (civil o natural), salvo a los detentadores (arrendatario, depositario).`;
    }

    const matches = [];
    for (const item of manualJson) {
        let score = 0;
        const itemTerm = item.termino ? normalizarTexto(item.termino) : "";
        const itemDef = item.definicion ? normalizarTexto(item.definicion) : "";

        if (itemTerm.includes(termClean)) score += 100;
        if (itemDef.includes(termClean)) score += 50;
        tokens.forEach(t => {
            if (itemTerm.includes(t)) score += 20;
            if (itemDef.includes(t)) score += 10;
        });

        if (score > 0) {
            matches.push({
                texto: `[${item.termino}]: ${item.definicion}`,
                score: score
            });
        }
    }
    const mejoresFragmentos = matches.sort((a, b) => b.score - a.score).slice(0, 5);
    return mejoresFragmentos.map(m => m.texto).join("\n\n");
}

const buscarDigesto = (term) => {
    if (!term || !digestoJson.length) return [];
    const termClean = normalizarTexto(term);
    const tokens = termClean.split(/\s+/).filter(t => t.length > 3); 
    if (tokens.length === 0 && termClean.length > 0) tokens.push(termClean); 

    const matches = [];
    for (const entry of digestoJson) {
        let score = 0;
        const textoEsp = entry.texto_espanol ? normalizarTexto(entry.texto_espanol) : "";
        const textoLat = entry.texto_latin ? normalizarTexto(entry.texto_latin) : "";

        if (textoEsp.includes(termClean) || textoLat.includes(termClean)) score += 100;
        tokens.forEach(token => {
            if (textoEsp.includes(token)) score += 10;
            if (textoLat.includes(token)) score += 10;
        });

        if (score > 0) {
            matches.push({
                cita: entry.cita, 
                latin: entry.texto_latin ? entry.texto_latin.trim() : "",
                espanol: entry.texto_espanol ? entry.texto_espanol.trim() : "",
                score: score
            });
        }
    }
    return matches.sort((a, b) => b.score - a.score).slice(0, 8);
};

function buscarPagina(termino) {
    if (!termino || !indiceJson.length) return { pagina: null, titulo: null };
    const termClean = normalizarTexto(termino);
    const tokens = termClean.split(/\s+/).filter(t => t.length > 3); 
    if (tokens.length === 0) tokens.push(termClean);

    let mejorMatch = null;
    let maxScore = 0;
    indiceJson.forEach(item => {
        let score = 0;
        const tituloLower = normalizarTexto(item.titulo);
        if (tituloLower.includes(termClean)) score += 100;
        tokens.forEach(t => {
            if (tituloLower.includes(t)) score += 10;
        });
        if (item.palabrasClave && Array.isArray(item.palabrasClave)) {
             if (item.palabrasClave.some(k => normalizarTexto(k) === termClean)) score += 50;
             tokens.forEach(t => {
                 if (item.palabrasClave.some(k => normalizarTexto(k).includes(t))) score += 5;
             });
        }
        if (score > maxScore) {
            maxScore = score;
            mejorMatch = item;
        }
    });
    if (mejorMatch && maxScore > 0) return { pagina: mejorMatch.pagina, titulo: mejorMatch.titulo };
    return { pagina: null, titulo: null }; 
}

// --- ENDPOINTS ---

app.post('/api/consulta', async (req, res) => {
    try {
        const { tipo, termino, currentCaseText } = req.body;
        
        if (tipo === 'resolver' && currentCaseText) {
            const txt = normalizarTexto(currentCaseText);
            const key = txt.substring(0, 50);
            if (txt.includes("hurto") && DEMO_CACHE["hurto"]) return res.json({ respuesta: DEMO_CACHE["hurto"].respuesta });
            if (MEMORIA_DINAMICA.has(key)) return res.json({ respuesta: MEMORIA_DINAMICA.get(key) });
        }

        const terminoBusqueda = (tipo === 'resolver' && currentCaseText) ? currentCaseText : termino;
        const terminoNormalizado = terminoBusqueda ? terminoBusqueda.substring(0, 100) : ''; 
        
        const contextoFinal = getContextoRelevante(termino ? termino : '');
        const coincidencias = buscarDigesto(terminoNormalizado); 
        let bloqueDigesto = coincidencias.length > 0 
            ? coincidencias.map(c => `FUENTE LOCAL (${c.cita}): "${c.latin}" (${c.espanol})`).join("\n")
            : "NO SE HAN ENCONTRADO CITAS EXACTAS EN EL DIGESTO LOCAL.";

        const instruccionesSeguridad = `
        REGLAS DE RESOLUCIÓN:
        1. Basa tu fallo prioritariamente en el DIGESTO LOCAL y el CONTEXTO aportados.
        2. Si las fuentes no cubren el caso, utiliza principios generales del Derecho Romano.
        3. Tienes terminantemente prohibido inventar fuentes concretas. NO generes bibliografía ficticia ni cites juristas o numeraciones (D.x.x) que no estén en el bloque de fuentes.
        `;

        let promptSystem;
        if (tipo === 'resolver') {
            if (!currentCaseText) return res.status(400).json({ error: 'Falta texto.' });
            promptSystem = `
ROL: Juez Romano experto. Estilo directo y resolutivo. Cero retórica.
TAREA: Dictar Sentencia para: "${currentCaseText}".
FUENTES: ${bloqueDigesto}
INSTRUCCIONES: ${instruccionesSeguridad}
FORMATO: 1. FALLO. 2. MOTIVACIÓN JURÍDICA.
`;
        } else if (tipo === 'generar') {
            promptSystem = `
ROL: Profesor de Derecho Romano. Estilo académico, directo y al grano. Sin saludos ni florituras.
TAREA: Redactar ÚNICAMENTE el planteamiento (los hechos) de un caso práctico BREVE sobre "${termino}".
CONTEXTO MANUAL: ${contextoFinal || "Sin contexto adicional."}

INSTRUCCIONES Y REGLAS ABSOLUTAS:
1. Usa el contexto del manual para crear una situación realista con personajes romanos (Ticio, Cayo, Seya...).
2. PROHIBICIÓN TOTAL DE RESOLVER EL CASO: Tu respuesta debe contener exclusivamente los hechos del problema y terminar con una pregunta dirigida al alumno (ej. "¿Quién es el propietario?", "¿Qué acción puede interponer Ticio?"). 
3. TIENES TERMINANTEMENTE PROHIBIDO incluir la solución, dar pistas jurídicas, mencionar el fallo o explicar qué figura jurídica aplica. Solo los hechos.
4. Si el contexto del manual no es suficiente, emplea doctrina romana general, pero sin inventar citas.
`;
        } else { return res.status(400).json({ error: 'Tipo error' }); }

       const payload = { 
            contents: [{ parts: [{ text: promptSystem }] }],
            generationConfig: {
                temperature: 0.2, 
                topP: 0.1
            }
        };
        const respuestaIA = await callGeminiWithRetries(payload, 'laboratorio');
        
        if (tipo === 'resolver' && currentCaseText) {
            const key = normalizarTexto(currentCaseText).substring(0, 50);
            guardarEnMemoria(key, respuestaIA);
        }
        res.json({ respuesta: respuestaIA }); 
    } catch (error) { handleApiError(error, res); }
});

app.post('/api/buscar-pagina', (req, res) => { 
    res.json(buscarPagina(req.body.termino)); 
});

app.post('/api/consulta-unificada', async (req, res) => {
    try {
        const { termino } = req.body;
        const termLower = termino ? normalizarTexto(termino) : "";
        const pagInfo = buscarPagina(termino);

        if (DEMO_CACHE[termLower]) {
            const data = DEMO_CACHE[termLower].json;
            return res.json({
                respuesta: data.respuesta_principal, 
                moderno: data.conexion_moderna,      
                pagina: pagInfo.pagina, 
                titulo: pagInfo.titulo
            });
        }
        if (MEMORIA_DINAMICA.has(termLower)) {
             const jsonCached = limpiarYParsearJSON(MEMORIA_DINAMICA.get(termLower));
             return res.json({
                respuesta: jsonCached.respuesta_principal, 
                moderno: jsonCached.conexion_moderna,      
                pagina: pagInfo.pagina, 
                titulo: pagInfo.titulo
            });
        }

        const terminoNormalizado = termino ? termino.toLowerCase().trim() : '';
        const contextoManual = getContextoRelevante(terminoNormalizado);
        const coincidencias = buscarDigesto(terminoNormalizado);
        let digestoTxt = coincidencias.length > 0 
            ? coincidencias.map(c => `CITA: (${c.cita}) "${c.latin}"`).join('\n')
            : "";

        const prompt = `
Eres un académico riguroso de Derecho Romano.
Define y explica objetivamente el concepto: "${termino}".
CONTEXTO DEL MANUAL DE LA CÁTEDRA: ${contextoManual || "No hay contexto del manual disponible."}
FUENTES DIGESTO: ${digestoTxt || "No hay fuentes del Digesto disponibles."}

INSTRUCCIONES Y REGLAS:
1. Responde basándote prioritariamente en el CONTEXTO DEL MANUAL y las FUENTES DIGESTO aportadas. Si no son suficientes, utiliza principios generales.
2. Prohibición total de inventar fuentes concretas o bibliografía ficticia. 
3. ESTILO ESTRICTO: Ve directamente al grano. Tienes totalmente prohibido usar saludos, introducciones teatrales o frases como "Bienvenido a la cátedra" o "Según el manual de la asignatura". Sé conciso, objetivo y estructurado (usa listas o encabezados si ayuda a la claridad).
4. Redacta la respuesta utilizando exclusivamente vocabulario y gramática de España.

FORMATO JSON OBLIGATORIO: { "respuesta_principal": "...", "conexion_moderna": "..." }
NO escribas nada fuera del JSON.
`;
        
        const payload = { 
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2, 
                topP: 0.1
            }
        };
        const respuestaTexto = await callGeminiWithRetries(payload, 'ulpiano');
        guardarEnMemoria(termLower, respuestaTexto);
        const jsonRespuesta = limpiarYParsearJSON(respuestaTexto);
        
        res.json({
            respuesta: jsonRespuesta.respuesta_principal,
            moderno: jsonRespuesta.conexion_moderna,
            pagina: pagInfo.pagina, 
            titulo: pagInfo.titulo   
        });
    } catch (error) { handleApiError(error, res); }
});

app.post('/api/consulta-parentesco', async (req, res) => {
    try {
        const { person1, person2 } = req.body;
        const prompt = `Calcula parentesco romano entre ${person1} y ${person2}. Responde JSON: { "linea": "...", "grado": "...", "explicacion": "..." }`;
        const payload = { 
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0 } 
        };
        const resp = await callGeminiWithRetries(payload, 'parentesco');
        res.json(limpiarYParsearJSON(resp));
    } catch (error) { handleApiError(error, res); }
});

app.get('/', (req, res) => {
    console.log(`[PING] Petición recibida en / a las ${new Date().toISOString()} - Método: ${req.method}`);
    res.sendFile(path.join(__dirname, 'index.html'));
});

const startServer = async () => {
    try {
        manualJson = JSON.parse(await fs.readFile('manual.json', 'utf-8'));
        indiceJson = JSON.parse(await fs.readFile('indice.json', 'utf-8'));
        try {
            digestoJson = JSON.parse(await fs.readFile('digesto_traducido_final.json', 'utf-8'));
        } catch (e) {
            console.log("⚠️ Usando digesto.json...");
            digestoJson = JSON.parse(await fs.readFile('digesto.json', 'utf-8'));
        }
        
        console.log(`✓ SERVIDOR ACTIVO. Modelo de Alta Precisión: Gemini 3.1 Pro Preview`);
        app.listen(port, () => console.log(`🚀 http://localhost:${port}`));
    } catch (error) {
        console.error("❌ ERROR DE ARRANQUE:", error.message);
    }
};

startServer();