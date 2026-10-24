# TempoKey — BPM y tonalidad para DJs

## Estado honesto
- ✅ Verificado: las 6 pruebas unitarias (Camelot, armonía, BPM, compatibilidad, CSV) pasan con `npm test`.
- ❌ NO verificado: llamadas reales a GetSongBPM (falta tu clave), el formato exacto de `/search` y `/tempo`, el diseño en navegador, el despliegue.

## Fuente de datos
**GetSongBPM** (https://getsongbpm.com/api): gratuita, requiere clave API, **exige un enlace visible a getsongbpm.com** (ya incluido en «Acerca de»; si no, suspenden la cuenta). Ofrece BPM, tonalidad y (en ficha de canción) Camelot. Cuotas y uso comercial: no he podido confirmar cifras; consúltalas en su web antes de publicar. Spotify no sirve: su API de características de audio no está disponible para apps nuevas (dato de memoria, verifícalo).

## Ejecutar en local
1. Registra tu app en https://getsongbpm.com/api y obtén la clave.
2. `cp .dev.vars.example .dev.vars` y pega la clave.
3. `npm install && npm run dev` → http://localhost:8788
4. `npm test`

## Publicar gratis (Cloudflare Pages)
Sube el repositorio a GitHub → Cloudflare Pages: directorio de salida `public`, sin comando de build → Ajustes → Variables → secreto `GETSONGBPM_API_KEY`. Registra la URL final en GetSongBPM. Verifica antes los límites vigentes del plan gratuito.

## Costes
| Servicio | Función | Coste | Riesgo |
|---|---|---|---|
| GetSongBPM | Datos | 0 € (con enlace obligatorio) | Cuota/condiciones pueden cambiar → cambiar `src/providers/` |
| Cloudflare Pages + Functions | Hosting y proxy de clave | 0 € (plan gratuito, verificar límites) | Exceder cuota |
| Dominio propio | Opcional | De pago | — |

## Reglas
Camelot por clase de tono (C=8B, Am=8A, F♯m=11A…). Compatibilidad estricta: misma, ±1 misma letra, relativa A/B; flexible añade ±2. Dif.% = (objetivo−original)/original×100. Doble/mitad es opcional y se etiqueta. Datos ausentes → «—» y se excluyen de recomendaciones. CSV: UTF-8 con BOM, todo entrecomillado, prefijo `'` contra fórmulas.

## Limitaciones
Sin límite de peticiones propio (solo el de Cloudflare/fuente); `src/` se duplica en `public/src` (copia manual: `cp -r src public/`); sin política de privacidad completa; sin inglés aún (textos en `index.html`/`app.js`); privacidad: GetSongBPM y Cloudflare procesan las consultas.
