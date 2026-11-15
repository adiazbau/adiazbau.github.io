# UlpianoIA: biblioteca privada (Lecciones 2026, Introducción 2023, Bases 2026)

Esta rama añade recuperación documental a UlpianoIA y al Laboratorio de Casos, y muestra un pie de respuesta con proveedor real y referencias documentales. **No contiene el texto de los manuales**.

## Fuentes y orden

1. *Lecciones de Derecho Romano* (2026): fuente principal; 23 temas; referencias de página **inicial de tema** basadas en el índice de la obra.
2. *El Derecho Romano como introducción al Derecho* (2023): ampliación doctrinal y ejemplos.
3. *Bases del sistema jurídico continental* (2026): comparación con el Derecho moderno.

## Instalación privada en Render, ANTES de fusionar

1. Descargar el archivo **ulpiano_library.b64** enviado separadamente y no subirlo a GitHub ni a Netlify.
2. Render → servicio `derechoromano` → **Environment** → **Secret Files** → **Add Secret File**.
3. Filename: `ulpiano_library.b64`; Contents: pegar todo el contenido del archivo. Guardar.
4. Render monta el archivo en `/etc/secrets/ulpiano_library.b64`; el backend lo lee al arrancar. **La ruta privada no está expuesta como endpoint**. Además, el servidor bloquea URL de extensiones `.b64`, `.gz`, `.docx`, `.pdf`.
5. Antes de fusionar, confirmar en Render que la Secret File se guardó correctamente; después, fusionar y comprobar en logs: `[PRIVATE_LIBRARY] {"fragments":1243,...}`. La respuesta pública devuelve un error 503 si falta esta biblioteca, en lugar de dar información de páginas antiguas.

La secret file tiene 573 364 caracteres y está **comprimida pero NO cifrada**. Render admite hasta 1 MB de Secret Files por servicio/grupo (sumadas). No compartir el contenido. El servidor utiliza solo fragmentos recuperados para cada consulta: hasta cuatro pasajes, máximo 6 500 caracteres de contexto. Esto limita la exposición, pero **no garantiza imposibilidad absoluta de reproducción mediante consultas adversariales**.

Los pasajes seleccionados se transmiten a Google Gemini u OpenAI, según la configuración y fallos de respaldo. Confirmar que el uso respeta las condiciones editoriales pertinentes, especialmente para *Bases del sistema jurídico continental*.

## Proveedores y pruebas

Los alumnos **no disponen de selector**. `AI_PROVIDER` y `AI_FALLBACK_ENABLED` conservan el funcionamiento automático. Cada respuesta generada incluye `proveedor` y `modelo`, además de una lista de `fuentes` consultadas. No afirmar que las fuentes prueban íntegramente la respuesta: indican material recuperado.

Para comparar modelos de modo privado, configurar el secreto `ADMIN_STATS_TOKEN` en Render; realizar una solicitud API a las rutas existentes con los encabezados `x-admin-token` y `x-test-provider: openai` o `gemini`. El servidor ignora `x-test-provider` si el token no es válido.

## Alcance de la validación

Se ha comprobado la sintaxis de `servidor.js`, `biblioteca_privada.js` y los scripts de `index.html`. Pendiente: despliegue de prueba con archivo secreto realmente instalado, revisión de resultados con preguntas de muestra, calidad de referencias, y pruebas de seguridad. El índice histórico `indice.json` no se usa para mostrar páginas al alumno; la reconstrucción completa por epígrafe queda pendiente.
