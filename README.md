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

## Stack

**Backend:**
- Fastify (capa HTTP, 2x más rápido que Express)
- @babel/parser, @babel/traverse (manipulación AST)
- Test runner nativo de Node.js

**Frontend:**
- Lit (web components)
- Vite (dev server, bundler)

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

## Fuera de Scope

Servicios, observers, mixins, modifiers complejos, routing, templates Handlebars (planeado).

## Convenciones Git

[Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
