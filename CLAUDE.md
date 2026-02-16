# Ember to Lit Converter

## Objetivo

Convertir componentes Ember a Lit, automatizando el 70-80% del trabajo y marcando con TODOs lo que requiere revisión manual.

## Arquitectura

```
Ember → Parser → AST → Extractor → IR → Generator → Lit
```

**Componentes:**

- `src/parser.js` - Lee Ember, genera AST con `@babel/parser`
- `src/extractor.js` - AST → IR neutral usando `@babel/traverse`
- `src/generator.js` - IR → código Lit con template strings
- `src/writer.js` - Guarda archivos en `./output/`

**IR (Intermediate Representation):**

```javascript
{
  className: string,
  trackedProperties: [{ name: string, initialValue: any }],
  imports: [{ source: string, specifiers: string[] }],
  methods: [{ name: string, params: string[] }]
  // Futuro: computedProperties, services
}
```

## Decisiones Clave

**¿Por qué IR en lugar de transformar AST directamente?**

- Control total sobre código generado
- Permite generar para múltiples frameworks (React, Vue) reutilizando el mismo extractor
- Más fácil debuggear

## Stack

- Node.js ES modules
- `@babel/parser`, `@babel/traverse`

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

## Estado Actual

✅ Parser, Extractor, Generator, Writer funcionando
✅ Hemos seleccionado la libreria interna de Node.js para realizar test unitarios
✅ API HTTP con Fastify
🔜 Extender nuestra aplicación para que transforme:

- getters
- setters
- constructor
- @action
- @computed

  🔜 parsear templates Handlebars

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

**Formato:** `<tipo>(<alcance>): <descripción en 1 linea como máximo de 72 carácteres>`

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

**Flujo de Trabajo (Git)**

- **Rama principal:** `main` (siempre estable).
- **Ramas de trabajo:** Crear ramas `feat/nombre-de-la-feature` o `fix/nombre-de-la-feature` para cambios significativos.
- **Antes de mergear:** Es obligatorio pasar los tests unitarios
