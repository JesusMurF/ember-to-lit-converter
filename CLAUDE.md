# Ember to Lit Converter

## Objetivo

Convertir componentes Ember a Lit, automatizando el 70-80% del trabajo y marcando con TODOs lo que requiere revisión manual.

## Arquitectura

```
Ember → Parser → AST → Extractor → IR → Generator → Lit
```

**Componentes:**

- `src/parser.js` - Lee Ember, genera AST con `@babel/parser`
- `src/extractor.js` - AST → IR neutral usando `@babel/traverse` y `@babel/generator`
- `src/generator.js` - IR → código Lit con template strings
- `src/writer.js` - Guarda archivos en `./output/`

**IR (Intermediate Representation):**

```javascript
{
  className: string,
  trackedProperties: [{ name: string, initialValue: any }],
  imports: [{ source: string, specifiers: string[] }],
  methods: [{ name: string, params: string[], body: string, isAction: boolean }],
  getters: [{ name: string, body: string }],
  setters: [{ name: string, param: string, body: string }],
  classConstructor: { params: string[], body: string } | null
  // Futuro: @computed
}
```

## Decisiones Clave

**¿Por qué IR en lugar de transformar AST directamente?**

- Control total sobre código generado
- Permite generar para múltiples frameworks (React, Vue) reutilizando el mismo extractor
- Más fácil debuggear

## Stack

- Node.js ES modules
- `@babel/parser`, `@babel/traverse`, `@babel/generator`

## Frontend

**Tecnologías:** Lit + Vite + Tailwind CSS v4

**Tailwind CSS + Shadow DOM**

Los componentes Lit usan Shadow DOM que aísla los estilos. Se descartó deshabilitar el Shadow DOM (perdería la esencia de los Web Components). La solución elegida es inyectar Tailwind en el Shadow DOM vía `unsafeCSS`, exportado desde un módulo compartido para evitar duplicación cuando haya múltiples componentes:

- `frontend/src/tailwind.css` — `@import "tailwindcss"` + tokens de diseño en `@theme`
- `frontend/src/styles/tailwind.styles.js` — exporta `tailwindCss = unsafeCSS(tailwindStyles)`

Cada componente importa `tailwindCss` y lo añade a su `static styles`. Vite incluye el módulo una sola vez en el bundle; los Constructable Stylesheets del navegador comparten el mismo `CSSStyleSheet` entre Shadow DOMs.

**Tokens de diseño (`@theme` en `tailwind.css`)**

Definen utilidades Tailwind semánticas reutilizables. Añadir un token aquí lo hace disponible como clase en todos los componentes:

```css
--color-text-primary: #ededed;    → text-text-primary
--color-text-secondary: #888888;  → text-text-secondary
--color-bg-input: #0a0a0a;        → bg-bg-input
--color-bg-output: #111111;       → bg-bg-output
--color-border-subtle: #2a2a2a;   → border-border-subtle
--color-error: #ff4444;           → text-error
--font-geist: 'Geist', ...        → font-geist
--font-geist-mono: 'Geist Mono'   → font-geist-mono
```

**Propuesta futura: transformación de templates Handlebars**

La transformación completa de un componente Ember requiere procesar también el `.hbs`. La arquitectura propuesta añade un pipeline paralelo que converge en el IR:

```
Ember JS  → parser.js     → extractor.js     → ─────────────────────┐
                                                                       ├→ IR → generator.js → Lit
Ember HBS → hbs-parser.js → hbs-extractor.js → ─────────────────────┘
```

- **Parser HBS:** `@glimmer/syntax` (parser oficial de Ember/Glimmer)
- **IR:** añadir campo `template: { nodes: [...] } | null`
- **Generator:** usar `ir.template` para generar el `render()` en lugar del TODO actual

Transformaciones automáticas previstas:

| Handlebars | Lit |
|---|---|
| `{{this.prop}}` | `${this.prop}` |
| `{{#if cond}}...{{/if}}` | `${cond ? html\`...\` : ''}` |
| `{{#each items as \|item\|}}` | `${items.map(item => html\`...\`)}` |
| `{{on "click" this.handler}}` | `@click=${this.handler}` |

Helpers complejos, componentes anidados y modifiers avanzados generarán TODOs.

**Propuesta futura: UI con tabs JS/HBS**

El panel de entrada del frontend evolucionará a dos pestañas (JS y HBS) para permitir convertir el componente completo. El panel de salida (Lit) no cambia.

## API Framework

**Fastify** fue seleccionado para la capa HTTP:

- **Performance:** 2x más rápido que Express, crítico para parsing intensivo en CPU
- **Validación integrada:** JSON Schema validation vía Ajv sin dependencias extra
- **Async/await moderno:** Soporte nativo para promesas
- **Consistencia:** Alineado con ES modules y test runner nativo de Node.js
- **Logging integrado:** Pino logger incluido

## Scope

**Fuera de scope inicial:**
Servicios, observers, mixins, modifiers complejos, routing

## Linting y Formateo

**ESLint 9+ (flat config)** + **Prettier** configurados en ambos packages.

**Configuración:**

- `eslint.config.js` — Flat config con `eslint-config-prettier` al final (evita conflictos)
- `.prettierrc` — Single quotes, trailing commas, semicolons, 2 espacios, 80 chars
- `.prettierignore` — Excluye `node_modules/`, `output/`, `dist/`, `frontend/`

**Plugins:**

- **Backend:** `eslint-plugin-jsdoc` (enforces JSDoc conventions)
- **Frontend:** `eslint-plugin-lit` (Lit-specific rules)

**Comandos:**

```bash
# Backend (root)
npm run lint          # Ejecutar ESLint
npm run lint:fix      # Auto-fix ESLint
npm run format        # Formatear con Prettier
npm run format:check  # Verificar formateo

# Frontend
cd frontend
npm run lint          # Ejecutar ESLint
npm run format        # Formatear con Prettier
```

**Regla importante:** `eslint-config-prettier` siempre debe ir al final del array en `eslint.config.js` para que Prettier tenga prioridad sobre reglas de formateo.

## Estado Actual

✅ Parser, Extractor, Generator, Writer funcionando
✅ Hemos seleccionado la libreria interna de Node.js para realizar test unitarios
✅ API HTTP con Fastify
✅ ESLint + Prettier configurados (backend y frontend)
✅ Extracción y transpilación de getters (nombre + body)
✅ Extracción del body de métodos usando `@babel/generator`
✅ Extracción y generación del constructor de clase
✅ Extracción y generación de métodos con decorador `@action` (como arrow functions en Lit)
✅ Extracción y generación de setters
✅ Frontend rediseñado con tema oscuro estilo Vercel (Geist font, paleta negro/blanco)
✅ Tailwind CSS v4 integrado en el frontend con patrón de módulo compartido (`tailwind.styles.js`)
🔜 Extender nuestra aplicación para que transforme:

- @computed

🔜 Parsear y transformar templates Handlebars (`.hbs`) a `html\`\`` de Lit
🔜 UI del frontend: panel de entrada con tabs JS/HBS para convertir componentes completos

## Comandos

```bash
npm install
node src/index.js  # Transpila example-component.js
```

## Conceptos Esenciales

**AST:** Árbol que representa tu código. Cada parte es un nodo con tipo.

**Traverse:** Recorre el AST visitando nodos específicos:

```javascript
traverse(ast, {
  ClassProperty(path) {
    const name = path.node.key.name;
    const hasTracked = path.node.decorators?.some(
      (d) => d.expression.name === 'tracked',
    );
  },
});
```

**IR:** Representación neutral entre frameworks. Captura semántica, no implementación.

Cuando extendamos las capacidades de nuestro transformador de código iremos paso a paso. Primero modificar el extractor y luego el generador. Pero debo especificarte yo los pasos explicitamente.

## Documentación con JSDoc

**Directrices generales:**

- Toda documentación debe estar en **inglés**
- Preferir JSDoc sobre comentarios single-line para funciones y exports
- Documentar todas las funciones exportadas y APIs públicas
- Mantener la documentación **concisa pero clara**
- No documentar cada propiedad interna de objetos a menos que sea necesario

**¿Qué documentar?**

- Funciones exportadas (`export function`, `export async function`)
- Constantes exportadas con esquemas o configuración
- Parámetros de funciones (usando `@param`)
- Valores de retorno (usando `@returns`)
- Funciones asíncronas (usando `@async`)
- Errores que puede lanzar (usando `@throws`)

**Ejemplo correcto:**

```javascript
/**
 * Converts an Ember component to a Lit component.
 *
 * @async
 * @param {object} request - Fastify request object with body.code
 * @param {object} reply - Fastify reply object
 * @returns {Promise<{litCode: string}>} Generated Lit component code
 * @throws {Error} Returns 400 for syntax errors, 500 for unexpected errors
 */
export async function handler(request, reply) {
  // implementation
}
```

**Ejemplo incorrecto:**

```javascript
/**
 * Converts an Ember component to a Lit component.
 *
 * @async
 * @param {object} request - Fastify request object
 * @param {object} request.body - Request body
 * @param {string} request.body.code - Ember code
 * @param {number} request.body.length - Code length
 * // ... demasiado detalle innecesario
 */
```

## Git

**Convención:** [Conventional Commits](https://www.conventionalcommits.org/)

**Formato:** `<tipo>(<alcance>): <descripción en 1 linea como máximo de 120 carácteres>`

**Tipos permitidos:**

- `feat`: Nueva funcionalidad (ej: añadir extracción de métodos).
- `fix`: Corrección de errores en la transpilación.
- `docs`: Cambios en documentación o CLAUDE.md.
- `test`: Añadir o modificar tests.
- `refactor`: Cambio de código que ni corrige errores ni añade funciones.
- `chore`: Tareas de mantenimiento, actualización de dependencias, etc.

**Reglas de estilo:**

- Commits redactados en inglés siempre.
- Usar imperativo y presente: "add" en lugar de "added".
- Primera letra de la descripción en minúscula.
- Sin punto final al terminar el mensaje.

**Ejemplos para este proyecto:**

- `feat(extractor): add visitor for ClassMethod nodes`
- `fix(parser): handle decorator syntax in Ember classes`
- `test(generator): add unit tests for Lit template output`
- `docs(readme): update architecture diagram`
- `chore: install vitest as test runner`

**Formato de Commits:**

Los commits deben tener una descripción concisa en una sola línea, seguida del Co-Authored-By:

```
<tipo>(<alcance>): <descripción>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Ejemplo real:**

```
feat(frontend): add Lit SPA with Vite

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Flujo de Trabajo (Git)**

- **Rama principal:** `main` (siempre estable).
- **Ramas de trabajo:** Crear ramas `feat/nombre-de-la-feature` o `fix/nombre-de-la-feature` para cambios significativos.
- **Antes de mergear:** Es obligatorio pasar los tests unitarios
