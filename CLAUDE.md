# Ember to Lit Converter

Convierte componentes Ember a Lit, automatizando el 70-80% del trabajo y marcando TODOs donde se requiere revisión manual.

## Arquitectura

```
Ember → parser.js → AST → extractor.js → IR → generator.js → Lit
```

| Archivo | Rol |
|---|---|
| `src/parser.js` | Ember JS → AST (`@babel/parser`) |
| `src/extractor.js` | AST → IR (`@babel/traverse` + `@babel/generator`) |
| `src/generator.js` | IR → código Lit |
| `src/index.js` | Orquestador (entrada CLI) |
| `src/api/server.js` | Fastify server |
| `src/api/routes/convert.js` | Ruta POST /convert |
| `api/convert.js` | Adaptador Fastify → Vercel Serverless |

**IR schema:**

```javascript
{
  className: string,
  trackedProperties: [{ name: string, initialValue: any }],
  imports: [{ source: string, specifiers: string[] }],
  methods: [{ name: string, params: string[], body: string, isAction: boolean }],
  getters: [{ name: string, body: string }],
  setters: [{ name: string, param: string, body: string }],
  classConstructor: { params: string[], body: string } | null
}
```

## Workflow de Extensión

**Regla crítica:** Al extender capacidades, ir paso a paso: **primero extractor, luego generator**. Los pasos los especifica el usuario explícitamente — nunca asumir el siguiente.

## Stack

- Node.js ES modules
- Backend: `@babel/parser`, `@babel/traverse`, `@babel/generator`, Fastify, Pino
- Frontend: Lit + Vite + Tailwind CSS v4
- Tests: Node.js test runner nativo

## Frontend

**Tailwind en Shadow DOM** — Shadow DOM aísla estilos; solución: inyectar vía `unsafeCSS` desde módulo compartido:
- `frontend/src/tailwind.css` — `@import "tailwindcss"` + tokens en `@theme`
- `frontend/src/styles/tailwind.styles.js` — exporta `tailwindCss = unsafeCSS(tailwindStyles)`

Cada componente Lit importa `tailwindCss` y lo añade a `static styles`.

**Design tokens** (`--color-*` en `@theme` → clases Tailwind):

```
text-text-primary: #ededed    text-text-secondary: #888    bg-bg-input: #0a0a0a
bg-bg-output: #111            border-border-subtle: #2a2a2a  text-error: #ff4444
font-geist                    font-geist-mono
```

## API y Despliegue (Vercel)

```
Frontend (Static)    → frontend/dist    (npm run build --prefix frontend)
Backend (Serverless) → api/convert.js  (Fastify adaptado)
```

**Gotcha del adaptador Fastify:** `api/convert.js` usa `app.server.emit('request', req, res)` para adaptar Fastify a la interfaz Vercel. La instancia `app` vive fuera del handler (cold start optimization). `logLevel: 'error'` en producción.

**Env vars:**
- `VITE_API_URL` — URL completa del endpoint (requerida en build del frontend)
- `CORS_ORIGIN` — origen permitido en producción

**`vercel.json`:**
```json
{
  "buildCommand": "npm run build --prefix frontend",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install && npm install --prefix frontend"
}
```

## Pending Work

- 🔜 `@computed` → extractor + generator
- 🔜 Templates HBS → `html\`\`` de Lit (arquitectura futura abajo)
- 🔜 UI frontend: tabs JS/HBS en panel de entrada

**Arquitectura futura (HBS):**
```
Ember JS  → parser.js     → extractor.js     → ┐
                                                 ├→ IR → generator.js → Lit
Ember HBS → hbs-parser.js → hbs-extractor.js → ┘
```
Parser: `@glimmer/syntax`. IR añade campo `template: { nodes: [...] } | null`.

| Handlebars | Lit |
|---|---|
| `{{this.prop}}` | `${this.prop}` |
| `{{#if cond}}...{{/if}}` | `` ${cond ? html`...` : ''} `` |
| `{{#each items as \|item\|}}` | `` ${items.map(item => html`...`)} `` |
| `{{on "click" this.handler}}` | `@click=${this.handler}` |

Helpers complejos, componentes anidados y modifiers → TODOs.

## Fuera de Scope

Servicios, observers, mixins, modifiers complejos, routing.

## Linting

- **ESLint 9 flat config** — `eslint-config-prettier` siempre al final (evita conflictos con Prettier)
- **Plugins:** `eslint-plugin-jsdoc` (backend), `eslint-plugin-lit` (frontend)
- **Prettier:** single quotes, trailing commas, semicolons, 2 espacios, 80 chars

```bash
npm run lint        # ESLint (root/backend)
npm run lint:fix
npm run format      # Prettier
cd frontend && npm run lint && npm run format
```

## JSDoc

Inglés. Documentar todas las funciones y constantes exportadas con `@param`, `@returns`, `@async`, `@throws`. No documentar propiedades internas de objetos. No sobredocumentar params obvios.

## Git

**Formato:** `<tipo>(<scope>): <descripción>` — inglés, imperativo, minúscula, sin punto, máx 120 chars.

**Co-Authored-By obligatorio:**
```
feat(extractor): add visitor for @computed decorators

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

- Ramas: `feat/<name>` o `fix/<name>`
- Antes de mergear: pasar tests unitarios

## Comandos

```bash
node src/index.js                    # Transpila example-component.js
npm run build --prefix frontend      # Build frontend
```
