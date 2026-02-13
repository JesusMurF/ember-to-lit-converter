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

## Scope

**MVP (actual y próximo):**

- ✅ Clase, @tracked props, imports, methods
- 🔜 event handlers, templates básicos (interpolación, if, each)

**Fuera de scope inicial:**
Servicios, observers, mixins, modifiers complejos, routing

## Estado Actual

✅ Parser, Extractor, Generator, Writer funcionando
✅ Hemos seleccionado la libreria interna de Node.js para realizar test unitarios
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

## Git

**Convención:** [Conventional Commits](https://www.conventionalcommits.org/)

**Formato:** `<tipo>(<alcance>): <descripción en 2 lineas como máximo>`

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
