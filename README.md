# Ember to Lit Converter

Herramienta que automatiza el 70-80% de la migración de componentes Ember a Lit Web Components. Parsea el JS del componente, genera el equivalente en Lit y marca con `TODO` lo que requiere revisión manual. Orientada a equipos migrando proyectos Ember a Web Components modernos.

<!-- TODO: añadir screenshot o GIF de la interfaz web -->

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js, Fastify, Babel |
| Frontend | Lit, Vite, Tailwind CSS v4 |
| Despliegue | Vercel |

## Requisitos

- Node.js ≥ 20.19.3
- npm

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JesusMurF/ember-to-lit-converter.git
cd ember-to-lit-converter

# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
npm install --prefix frontend
```

### Variables de entorno

Crea un archivo `.env` en `frontend/` con:

```
VITE_API_URL=http://localhost:3000/api/convert
```

En producción, apunta a la URL del backend desplegado.

## Uso

**Arrancar el backend (puerto 3000):**
```bash
npm run dev
```

**Arrancar el frontend (puerto 5173):**
```bash
cd frontend && npm run dev
```

Abre http://localhost:5173, pega el código de un componente Ember y pulsa **Convert to Lit**.

**Llamada directa a la API:**
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"code": "export default class MyComponent extends Component { @tracked count = 0; }"}'
```

Respuesta: `{ "litCode": "..." }`

## Estructura del proyecto

```
/src        # Backend: parser, extractor, generator, API Fastify
/frontend   # Frontend SPA (Lit + Vite)
/test       # Tests unitarios (Node.js test runner nativo)
/api        # Adaptador Fastify para Vercel Serverless
```

## Contribuir

1. Crea una rama desde `main`: `feat/<nombre>` o `fix/<nombre>`
2. Asegúrate de que los tests pasan: `npm test`
3. Abre un PR con un mensaje siguiendo [Conventional Commits](https://www.conventionalcommits.org/)

## Licencia

ISC
