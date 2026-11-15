# Proveedores de IA y contador de uso (prueba)

El archivo `servidor.js` conserva Gemini como proveedor por defecto. La API de OpenAI queda preparada pero **no se utiliza hasta configurarla**. Las rutas existentes de UlpianoIA, Laboratorio de Casos y parentesco no cambian.

## Configurar en Render → Environment

- `GEMINI_API_KEY`: mantener la clave actual.
- `AI_PROVIDER=gemini`: proveedor principal por defecto.
- `OPENAI_API_KEY`: clave nueva de la API de OpenAI, creada en platform.openai.com (no es la suscripción ChatGPT). No introducirla en GitHub ni enviarla por correo.
- `OPENAI_MODEL=gpt-5.4-mini`: modelo alternativo; verificar que esté disponible para la cuenta antes de activarlo.
- `AI_FALLBACK_ENABLED=false`: no hay cambio automático; poner `true` solo después de verificar la cuenta y los límites de gasto. Ante errores HTTP 402, 429 o >=500 del proveedor principal, permite intentar el otro.
- `ADMIN_STATS_TOKEN`: cadena secreta larga y aleatoria para consultar estadísticas. No incluir en el frontend público.

Para usar OpenAI como principal, poner `AI_PROVIDER=openai`. **No hace falta cambiar index.html.**

## Estadísticas

Las peticiones con respuesta correcta generan registros `[AI_USAGE]` con mes, proveedor, modelo, función, tokens y gasto estimado, sin almacenar las preguntas de los alumnos. Errores, respuestas de caché y solicitudes que no llegan a la API no cuentan como consumo facturable. Los precios son estimaciones editables en `UNIT_PRICES`, **no facturas**. Confirmar las tarifas vigentes y posibles costes adicionales en los paneles de cada proveedor.

La ruta `GET /api/admin/usage` exige el encabezado secreto `x-admin-token`. Ejemplo en terminal privada:

```bash
curl -H "x-admin-token: TU_TOKEN_PRIVADO" https://derechoromano-ecma.onrender.com/api/admin/usage
```

Esta ruta devuelve contadores **solo desde el último reinicio** del proceso Render. El registro histórico depende de la retención de logs del plan. Para acumulados fiables entre reinicios, habrá que añadir almacenamiento persistente (por ejemplo, una base de datos), que no se ha incorporado en esta primera fase.

## Seguridad y límites

- El contador no identifica estudiantes ni guarda preguntas. No registrar claves, solicitudes completas ni cabeceras de autorización.
- El rate limiter global de /api/ sigue vigente, pero limita solicitudes, **no el gasto total**. Configurar presupuesto y alertas en los proveedores. 
- Los logs de uso se generan cuando el proveedor devuelve una respuesta correcta; no prueban que todas las funciones visuales del navegador se hayan verificado.
- La rama no modifica la página docente ni activa OpenAI por sí sola.

## Prueba y despliegue

1. Revisar PR y fusionar solo cuando se quiera desplegar el nuevo backend.
2. Confirmar que Gemini sigue respondiendo tras el despliegue.
3. Crear clave de OpenAI y añadirla a Render Environment (sin compartirla).
4. Probar consultas de UlpianoIA y casos con `AI_PROVIDER=openai` y fallback desactivado; comprobar formato de respuesta y logs.
5. Volver a `AI_PROVIDER=gemini` y poner `AI_FALLBACK_ENABLED=true` solo si se desea realmente el respaldo con coste independiente.
