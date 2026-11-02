<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biblioteca de Ulpiano | Universidad de Murcia</title>
    <style>
        :root {
            --rojo-umu: #c60c30;
            --azul-ebsco: #005a9e;
            --gris-fondo: #f4f5f7;
            --texto-oscuro: #2b2b2b;
            --blanco: #ffffff;
            --negro-cabecera: #000000;
        }
        
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: var(--gris-fondo); color: var(--texto-oscuro); margin: 0; padding: 0; line-height: 1.6; }
        
        header { background-color: var(--negro-cabecera); color: var(--blanco); padding: 1.2rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .header-logo { height: 50px; transition: transform 0.2s; }
        .header-logo:hover { transform: scale(1.05); }
        .header-titulos { text-align: center; flex-grow: 1; }
        header h1 { margin: 0; font-size: 2rem; font-weight: 600; }
        header p { margin: 5px 0 0 0; font-size: 1rem; color: #cccccc; }
        
        .hero-section { max-width: 900px; margin: 40px auto; text-align: center; padding: 0 20px; }
        .hero-section h2 { color: var(--rojo-umu); font-size: 1.8rem; margin-bottom: 10px; }
        .hero-section p { color: #555; font-size: 1.1rem; margin-bottom: 25px; }

        .notebook-btn-hero { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #005a9e 0%, #003a6b 100%); color: white; text-decoration: none; padding: 12px 25px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,90,158,0.3); transition: transform 0.2s; margin-bottom: 10px; }
        .notebook-btn-hero:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,90,158,0.4); color: white; }

        .caja-busqueda-gigante { display: flex; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border-radius: 50px; overflow: hidden; background: white; margin-bottom: 20px; border: 2px solid transparent; transition: border 0.3s; }
        .caja-busqueda-gigante:focus-within { border-color: var(--rojo-umu); }
        .caja-busqueda-gigante input { flex-grow: 1; border: none; padding: 20px 30px; font-size: 1.3rem; outline: none; }
        .caja-busqueda-gigante button { background: var(--rojo-umu); color: white; border: none; padding: 0 40px; font-size: 1.2rem; font-weight: bold; cursor: pointer; transition: background 0.3s; }
        .caja-busqueda-gigante button:hover { background: #a00a26; }

        .filtros-pildora { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 40px; }
        .filtros-pildora label { display: inline-block; padding: 8px 18px; background: #e8ecef; color: #555; border-radius: 20px; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.2s; border: 2px solid transparent; }
        .filtros-pildora input[type="radio"] { display: none; }
        .filtros-pildora input[type="radio"]:checked + label { background: white; color: var(--rojo-umu); border-color: var(--rojo-umu); box-shadow: 0 2px 5px rgba(198,12,48,0.2); }

        .layout-resultados { display: none; grid-template-columns: 1fr 1fr; gap: 30px; max-width: 1300px; margin: 0 auto 40px auto; padding: 0 20px; align-items: start; }
        .columna-ulpiano { background: white; padding: 25px; border-radius: 12px; border-top: 5px solid var(--negro-cabecera); box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .columna-ulpiano h3 { margin-top:0; color: #111; border-bottom: 2px solid #eee; padding-bottom: 15px; }
        #ulpianoResultado { font-size: 1.05rem; line-height: 1.6; color: #333; }
        
        .columna-catalogo { background: transparent; }
        .columna-catalogo h3 { margin-top:0; color: var(--rojo-umu); margin-bottom: 5px; }
        .contador { margin-bottom: 20px; color: #666; font-size: 0.95rem; }
        .lista-tarjetas { display: flex; flex-direction: column; gap: 15px; }
        .tarjeta { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid var(--rojo-umu); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .btn-onedrive { display: inline-block; background-color: #0078d4; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px; border: none; cursor: pointer; margin-top: 10px; font-size: 0.9rem; font-weight: bold; }

        .seccion-recursos { max-width: 1200px; margin: 0 auto 50px auto; padding: 0 20px; }
        .seccion-recursos h3 { text-align: center; color: #444; margin-bottom: 30px; font-size: 1.4rem; }
        .grid-recursos { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .recurso-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
        .recurso-card h4 { margin: 0 0 10px 0; font-size: 1.15rem; color: #111; }
        .recurso-card p { font-size: 0.95rem; color: #666; margin-bottom: 20px; flex-grow: 1; }
        
        .mini-busqueda { display: flex; margin-bottom: 10px; }
        .mini-busqueda input { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px 0 0 4px; outline: none; }
        .mini-busqueda button { background: var(--azul-ebsco); color: white; border: none; padding: 0 15px; border-radius: 0 4px 4px 0; cursor: pointer; }
        
        .btn-recurso { text-align: center; padding: 10px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 0.9rem; display: block; margin-bottom: 8px; transition: background 0.2s; }
        .btn-outline { border: 2px solid var(--negro-cabecera); color: var(--negro-cabecera); }
        .btn-outline:hover { background: var(--negro-cabecera); color: white; }
        .btn-blue { background: #e6f2ff; color: var(--azul-ebsco); border: 1px solid var(--azul-ebsco); }
        .btn-blue:hover { background: var(--azul-ebsco); color: white; }

        footer { text-align: center; padding: 20px; color: #888; border-top: 1px solid #ddd; margin-top: 40px; }
        footer a { color: #555; text-decoration: none; font-weight: bold; }

        .modal-fondo { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
        .modal-contenido { background-color: #fff; margin: 5vh auto; padding: 30px; border-radius: 12px; width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; box-shadow: 0 5px 25px rgba(0,0,0,0.3); position: relative; animation: deslizarArriba 0.3s ease-out; line-height: 1.6; }
        .cerrar-modal { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; transition: color 0.2s; position: sticky; top: -20px; text-align: right; display: block; }
        .cerrar-modal:hover { color: var(--rojo-umu); }
        .btn-modal-descarga { display: inline-block; background: var(--rojo-umu); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 1.05rem; box-shadow: 0 4px 6px rgba(198,12,48,0.3); transition: transform 0.2s; margin-top: 15px; }
        .btn-modal-descarga:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(198,12,48,0.4); }
        @keyframes deslizarArriba { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 900px) {
            .layout-resultados { grid-template-columns: 1fr; }
            .caja-busqueda-gigante input { font-size: 1rem; padding: 15px; }
            .caja-busqueda-gigante button { padding: 0 20px; font-size: 1rem; }
        }
    </style>
</head>
<body>

    <header>
        <a href="https://www.um.es" target="_blank">
            <img src="escudo_umu.png" alt="Escudo Universidad de Murcia" class="header-logo" onerror="this.style.display='none'">
        </a>
        <div class="header-titulos">
            <h1>Biblioteca de Ulpiano</h1>
            <p>Repositorio dogmático y fuentes romanísticas</p>
        </div>
        <div style="width: 50px;"></div> 
    </header>

    <div class="hero-section">
        <h2>¿Qué concepto desea investigar?</h2>
        <p>Busque en nuestra base de datos doctrinal, consulte a la inteligencia artificial o acceda a su cuaderno de trabajo interactivo.</p>
        
        <a href="https://notebooklm.google.com/notebook/7984d1ca-0bfe-4df1-a3b4-f875f9af3a22" target="_blank" class="notebook-btn-hero">
            ✨ Chat con IA (NotebookLM)
        </a>
        
        <div style="margin-bottom: 25px;">
            <a href="#" onclick="abrirGuia(event)" style="color: #005a9e; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
                📖 ¿Cómo usar estas herramientas? (Instrucciones)
            </a>
            <span style="display: block; font-size: 0.8rem; color: #888; margin-top: 5px;">* El Chat con IA requiere iniciar sesión en Google</span>
        </div>

        <div class="caja-busqueda-gigante">
            <input type="text" id="cajaUnificada" placeholder="Ej. Fictio legis, Culpa levissima, Mancipatio..." onkeypress="if(event.key === 'Enter') ejecutarBusquedaGlobal()">
            <button onclick="ejecutarBusquedaGlobal()">Buscar</button>
        </div>

        <div class="filtros-pildora">
            <input type="radio" id="f-ambos" name="modoBusca" value="ambos">
            <label for="f-ambos">Búsqueda Total</label>
            
            <input type="radio" id="f-doc" name="modoBusca" value="doctrina">
            <label for="f-doc">Solo Doctrina (PDF)</label>
            
            <input type="radio" id="f-ia" name="modoBusca" value="ulpiano">
            <label for="f-ia">Solo UlpianoIA</label>
            
            <input type="radio" id="f-scholar" name="modoBusca" value="scholar">
            <label for="f-scholar">Google Scholar</label>
        </div>
    </div>

    <div class="layout-resultados" id="panelResultados">
        <div class="columna-ulpiano" id="columnaUlpiano">
            <h3>🤖 Respuesta de UlpianoIA</h3>
            <div id="ulpianoResultado">
                <span style="color: #888; font-style: italic;">Esperando consulta...</span>
            </div>
        </div>

        <div class="columna-catalogo" id="columnaCatalogo">
            <h3>📚 Doctrina Localizada</h3>
            <div class="contador" id="contadorResultados">Esperando consulta...</div>
            <div class="lista-tarjetas" id="contenedorResultados"></div>
        </div>
    </div>

    <div class="seccion-recursos">
        <h3>Recursos Adicionales y Bases de Datos</h3>
        <div class="grid-recursos">
            
            <div class="recurso-card">
                <h4>🌍 Red EBSCOhost</h4>
                <p>Revistas científicas y artículos internacionales suscritos por la UM.</p>
                <div class="mini-busqueda">
                    <input type="text" id="cajaEbsco" placeholder="Buscar en EBSCO...">
                    <button onclick="buscarEbsco()">🔍</button>
                </div>
            </div>

            <div class="recurso-card">
                <h4>📚 Fundación Dialnet</h4>
                <p>Hemeroteca de artículos científicos, tesis y revistas jurídicas en español.</p>
                <div class="mini-busqueda">
                    <input type="text" id="cajaDialnet" placeholder="Buscar en Dialnet...">
                    <button onclick="window.open('https://dialnet.unirioja.es/buscar/documentos?querysDismax.DOCUMENTAL_TODO=' + encodeURIComponent(document.getElementById('cajaDialnet').value), '_blank')">🔍</button>
                </div>
            </div>

            <div class="recurso-card">
                <h4>📜 Revista RIDROM</h4>
                <p>Revista Internacional de Derecho Romano (Universidad de Oviedo). Artículos y doctrina en acceso abierto.</p>
                <div class="mini-busqueda">
                    <input type="text" id="cajaRidrom" placeholder="Buscar en RIDROM...">
                    <button onclick="window.open('https://reunido.uniovi.es/index.php/ridrom/search/search?query=' + encodeURIComponent(document.getElementById('cajaRidrom').value), '_blank')">🔍</button>
                </div>
            </div>

            <div class="recurso-card">
                <h4>🏛️ Biblioteca de Doctrina (BOE)</h4>
                <p>Buscador oficial del BOE. Incluye el <em>Anuario de Historia del Derecho</em> y <em>Derecho y Bases Romanísticas del Derecho Contemporáneo</em>.</p>
                <a href="https://www.boe.es/biblioteca_juridica/anuarios_derecho/anuarios_derecho.php?tipo_anuario=R" target="_blank" class="btn-recurso btn-blue">Abrir buscador de Anuarios</a>
            </div>

            <div class="recurso-card">
                <h4>🏛️ The Roman Law Library</h4>
                <p>Fuentes clásicas primarias (Univ. de Grenoble).</p>
                <a href="https://droitromain.univ-grenoble-alpes.fr/" target="_blank" class="btn-recurso btn-blue">Ver en idioma original</a>
                <a href="https://translate.google.com/translate?hl=es&sl=la&tl=es&u=https://droitromain.univ-grenoble-alpes.fr/" target="_blank" class="btn-recurso btn-blue">Traducir al español</a>
            </div>

            <div class="recurso-card">
                <h4>📖 Biblioteca y Docencia</h4>
                <p>Catálogo oficial y plataformas de apoyo universitario.</p>
                <a href="https://bib-antonioreverte.um.es/" target="_blank" class="btn-recurso btn-outline">Bib. Antonio Reverte</a>
                <a href="https://derechoromano.netlify.app/" target="_blank" class="btn-recurso btn-outline">Guía Interactiva</a>
            </div>
            
        </div>
    </div>

    <div id="modalGuia" class="modal-fondo">
        <div class="modal-contenido">
            <span class="cerrar-modal" onclick="cerrarGuia()">&times;</span>
            <h2 style="color: var(--rojo-umu); border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0;">🏛️ Instrucciones de Biblioulpiano</h2>
            
            <p>Bienvenido a la plataforma integrada de investigación romanística. Dependiendo de tu fase de estudio, debes utilizar la herramienta adecuada:</p>
            
            <h4 style="color: var(--azul-ebsco); margin-bottom: 5px;">1. Solo Doctrina (Búsqueda de PDF)</h4>
            <p style="margin-top: 0; font-size: 0.95rem;"><strong>Para qué sirve:</strong> Para localizar y descargar la bibliografía del repositorio privado de la Universidad.<br>
            <strong>Cómo usar:</strong> Selecciona la píldora "Solo Doctrina", escribe tu concepto y pulsa buscar. Obtendrás las fichas y el botón para descargar el PDF original.</p>

            <h4 style="color: var(--azul-ebsco); margin-bottom: 5px;">2. Solo UlpianoIA (El Oráculo Clásico)</h4>
            <p style="margin-top: 0; font-size: 0.95rem;"><strong>Para qué sirve:</strong> Para obtener definiciones rápidas, naturaleza jurídica y la evolución dogmática basada en fuentes primarias.<br>
            <strong>Nota:</strong> Esta IA elabora síntesis estructurales, no lee los PDFs contemporáneos.</p>

            <h4 style="color: var(--azul-ebsco); margin-bottom: 5px;">3. ✨ Chat con IA (NotebookLM)</h4>
            <p style="margin-top: 0; font-size: 0.95rem;"><strong>Para qué sirve:</strong> Es tu asistente de tesis. Permite "chatear" directamente con el contenido íntegro de los cientos de PDFs del repositorio.<br>
            <strong>El formato de consulta ideal:</strong> No hagas preguntas genéricas. Usa instrucciones precisas como: <em>"Actúa como un investigador. Busca qué dicen los autores sobre [tu tema]. Haz un resumen e incluye las citas entre paréntesis indicando Autor, Libro y Página."</em></p>

            <div style="background-color: #fdf5f6; border-left: 4px solid var(--rojo-umu); padding: 15px; margin-top: 20px; border-radius: 4px;">
                <strong>⚠️ Regla de Oro del Investigador:</strong><br>
                La IA sugiere, el investigador verifica. Si el Chat con IA te ofrece una cita excelente, acude siempre al PDF original (usando la búsqueda de "Solo Doctrina") para comprobar el contexto exacto antes de llevarlo a tu tesis.
            </div>

            <div style="text-align: center; margin-top: 25px; border-top: 2px solid #eee; padding-top: 20px;">
                <p style="margin-bottom: 10px; font-weight: 600; color: #444;">¿Necesitas ayuda para estructurar tu investigación?</p>
                <a href="guia_tesis.pdf" target="_blank" class="btn-modal-descarga">
                    📥 Descargar Guía Completa de la Tesis (PDF)
                </a>
            </div>
        </div>
    </div>

    <footer>
        © <a href="https://diaz-bautista.netlify.app" target="_blank">Prof. Adolfo A. Díaz-Bautista Cremades</a> | Universidad de Murcia
    </footer>

    <script>
        const RUTA_REAL_ONEDRIVE = "https://univmurcia-my.sharepoint.com/my?id=%2Fpersonal%2Fadiaz-bautista_um_es%2FDocuments%2FBiblioteca%20Juridica%2FRepositorio_Doctorandos";
        let catalogo = [];
        let errorCatalogo = false;

        fetch('catalogo.json')
            .then(response => { if (!response.ok) throw new Error("No se encontró el archivo"); return response.json(); })
            .then(data => {
                const obrasUnicas = new Map();
                data.forEach(obra => {
                    const tituloLimpio = normalizarTexto(obra.titulo || "");
                    const autorLimpio = normalizarTexto(obra.autor || "");
                    const claveUnica = tituloLimpio + "_" + autorLimpio;
                    if (!obrasUnicas.has(claveUnica)) obrasUnicas.set(claveUnica, obra);
                });
                catalogo = Array.from(obrasUnicas.values());
            }).catch((err) => {
                console.error("Error al cargar catalogo.json:", err);
                errorCatalogo = true;
            });

        function abrirGuia(event) { event.preventDefault(); document.getElementById('modalGuia').style.display = 'block'; }
        function cerrarGuia() { document.getElementById('modalGuia').style.display = 'none'; }
        window.onclick = function(event) { const modal = document.getElementById('modalGuia'); if (event.target == modal) modal.style.display = "none"; }

        function buscarEbsco() {
            const termino = document.getElementById('cajaEbsco').value.trim();
            const urlBase = "https://research.ebsco.com/c/ysgo7r/search";
            window.open(termino ? urlBase + "?query=" + encodeURIComponent(termino) : urlBase, '_blank');
        }

        function ejecutarBusquedaGlobal() {
            const termino = document.getElementById('cajaUnificada').value.trim();
            if (!termino) return;

            const opcionSeleccionada = document.querySelector('input[name="modoBusca"]:checked');
            if (!opcionSeleccionada) {
                alert("Por favor, seleccione una herramienta de búsqueda (Búsqueda Total, Doctrina, UlpianoIA...) antes de buscar.");
                return;
            }

            const modoSeleccionado = opcionSeleccionada.value;
            const panelResultados = document.getElementById('panelResultados');
            const divUlpiano = document.getElementById('columnaUlpiano');
            const divCatalogo = document.getElementById('columnaCatalogo');

            if (modoSeleccionado === 'scholar') {
                window.open("https://scholar.google.es/scholar?hl=es&q=" + encodeURIComponent(termino), '_blank');
                return;
            }

            panelResultados.style.display = 'grid';

            if (modoSeleccionado === 'ambos') {
                panelResultados.style.gridTemplateColumns = '1fr 1fr';
                divUlpiano.style.display = 'block'; divCatalogo.style.display = 'block';
                filtrarCatalogo(termino); consultarUlpiano(termino);
            } else if (modoSeleccionado === 'doctrina') {
                panelResultados.style.gridTemplateColumns = '1fr'; 
                divUlpiano.style.display = 'none'; divCatalogo.style.display = 'block';
                filtrarCatalogo(termino);
            } else if (modoSeleccionado === 'ulpiano') {
                panelResultados.style.gridTemplateColumns = '1fr'; 
                divUlpiano.style.display = 'block'; divCatalogo.style.display = 'none';
                consultarUlpiano(termino);
            }
        }

        function normalizarTexto(texto) {
            return !texto ? "" : String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
        }

        function filtrarCatalogo(textoBusqueda) {
            const contenedor = document.getElementById('contenedorResultados');
            const contador = document.getElementById('contadorResultados');
            
            if (errorCatalogo) {
                contador.innerText = "⚠️ Error de conexión";
                contenedor.innerHTML = '<div style="background-color:#ffebee; color:#c60c30; padding:15px; border-radius:8px; border-left: 5px solid #c60c30;"><strong>No se pudo leer la base de datos local.</strong><br>Debes subir los archivos a tu servidor web para que funcione.</div>';
                return;
            }

            const terminos = normalizarTexto(textoBusqueda).split(' '); 
            const filtrados = catalogo.filter(obra => {
                const cadenaLimpia = normalizarTexto(`${obra.titulo || ''} ${obra.autor || ''} ${obra.tematica || ''} ${obra.resumen || ''}`);
                return terminos.every(t => cadenaLimpia.includes(t));
            });

            contador.innerText = `Obras encontradas: ${filtrados.length}`;
            contenedor.innerHTML = '';

            if (filtrados.length === 0) {
                contenedor.innerHTML = '<p style="color:#666; font-style:italic;">No se han encontrado resultados en la base de datos local.</p>';
                return;
            }

            filtrados.slice(0, 50).forEach(obra => {
                const nombreArchivo = obra.nuevo_nombre || obra.archivo_original || "";
                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta';
                tarjeta.innerHTML = `
                    <h4 style="margin:0 0 5px 0; color:#111; font-size:1.1rem;">${obra.titulo || 'Sin título'}</h4>
                    <p style="font-size:0.9rem; color:#666; margin-bottom:10px;"><strong>${obra.autor || 'Autor desconocido'}</strong> (${obra.ano || '-'})</p>
                    <p style="font-size:0.9rem; margin-bottom:15px; line-height:1.4;">${obra.resumen ? obra.resumen.substring(0,150) + '...' : 'Sin resumen disponible.'}</p>
                    <button class="btn-onedrive" onclick="window.open('${RUTA_REAL_ONEDRIVE}&q=${encodeURIComponent(nombreArchivo)}', '_blank')">Descargar PDF</button>
                `;
                contenedor.appendChild(tarjeta);
            });
        }

        async function consultarUlpiano(termino) {
            const divResultado = document.getElementById('ulpianoResultado');
            divResultado.innerHTML = '<span style="color:#666; font-style:italic;">⏳ Consultando al modelo (Puede tardar si estaba inactivo)...</span>';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 50000); 

            try {
                const response = await fetch('https://derechoromano-ecma.onrender.com/api/consulta-unificada', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ termino: termino }), signal: controller.signal
                });
                clearTimeout(timeoutId);
                const data = await response.json();
                if (data.error) divResultado.innerHTML = `<span style="color:#c60c30;">Error: ${data.error}</span>`;
                else divResultado.innerHTML = `<h4 style="color:var(--rojo-umu); margin-top:0;">Respuesta:</h4><p>${data.respuesta}</p>`.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            } catch (error) {
                divResultado.innerHTML = `<em>El término no fue localizado por la IA. Intente la búsqueda en "Solo Doctrina".</em>`;
            }
        }
    </script>
</body>
</html>