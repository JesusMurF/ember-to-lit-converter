# Ember to Lit Converter

Automatiza el 70-80% de la conversión de componentes Ember a Lit, marcando con TODOs lo que requiere revisión manual.

## Arquitectura

```
Ember → Parser → AST → Extractor → IR → Generator → Lit
```

**Backend:** Node.js + Fastify API
**Frontend:** Lit + Vite SPA

## Estructura del Proyecto

```
/src              # Backend (parser, extractor, generator, API)
/frontend         # Frontend SPA (Lit + Vite)
/test             # Tests unitarios
```

### Decisión de Estructura Frontend

Se eligió **carpeta `/frontend` separada** en lugar de monorepo o estructura mixta:
- Impacto mínimo en el backend existente
- Separación clara de responsabilidades
- `package.json` independiente por capa
- Fácil migrar a monorepo si escala

### Tailwind CSS + Shadow DOM

Los componentes Lit usan Shadow DOM, que aísla los estilos. Para usar Tailwind se optó por **inyectarlo en el Shadow DOM vía `unsafeCSS`**, exportado desde un módulo compartido:

```
frontend/src/tailwind.css          # @import "tailwindcss" + tokens de diseño (@theme)
frontend/src/styles/tailwind.styles.js  # export const tailwindCss = unsafeCSS(...)
```

Cualquier componente importa `tailwindCss` y lo añade a su `static styles`. Vite/Rollup incluye el módulo una sola vez en el bundle, y los Constructable Stylesheets del navegador comparten el mismo objeto `CSSStyleSheet` entre todos los Shadow DOMs.

Los tokens de diseño (colores, fuentes) están definidos en `tailwind.css` bajo `@theme`, lo que genera utilidades Tailwind semánticas reutilizables (`text-text-primary`, `bg-bg-input`, `font-geist-mono`, etc.).

## Stack

**Backend:**
- Fastify (capa HTTP, 2x más rápido que Express)
- @babel/parser, @babel/traverse (manipulación AST)
- Test runner nativo de Node.js

**Frontend:**
- Lit (web components)
- Vite (dev server, bundler)
- Tailwind CSS v4 (utilidades de estilos, inyectado en Shadow DOM vía `unsafeCSS`)

## Desarrollo

**Backend (puerto 3000):**
```bash
npm install
npm run dev
```

**Frontend (puerto 5173):**
```bash
cd frontend
npm install
npm run dev
```

**Acceso:**
- Frontend: http://localhost:5173
- API: http://localhost:3000/api/convert

## Funcionalidades Actuales

- ✅ Parsear componentes Ember (clases, tracked properties, métodos, getters, setters, actions, computed)
- ✅ Convertir a componentes Lit
- ✅ Endpoint HTTP API (`POST /api/convert`)
- ✅ Interfaz web (input/output con textareas)

## Linting y Formateo

ESLint 9+ (flat config) + Prettier en ambos packages.

```bash
# Backend
npm run lint          # Ejecutar ESLint
npm run lint:fix      # Auto-fix
npm run format        # Formatear con Prettier
npm run format:check  # Verificar formateo

# Frontend
cd frontend
npm run lint
npm run format
```

**Plugins:** `eslint-plugin-jsdoc` (backend), `eslint-plugin-lit` (frontend), `eslint-config-prettier` (ambos).

## Fuera de Scope

Servicios, observers, mixins, modifiers complejos, routing, templates Handlebars (planeado).

## Convenciones Git

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
