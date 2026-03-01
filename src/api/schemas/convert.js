/**
 * JSON Schema for the conversion request body.
 * Validates that the Ember component code is provided and within size limits (1 byte to 100KB).
 * @type {object}
 */
export const convertRequestSchema = {
  type: 'object',
  required: ['code'],
  properties: {
    code: {
      type: 'string',
      minLength: 1,
      maxLength: 102400,
      description: 'Ember component JavaScript code to convert',
    },
    hbs: {
      type: 'string',
      minLength: 1,
      maxLength: 102400,
      description: 'Ember Handlebars template code (optional)',
    },
  },
};

/**
 * JSON Schema for successful conversion responses (HTTP 200).
 * Contains the generated Lit component code.
 * @type {object}
 */
export const convertResponseSchema = {
  type: 'object',
  required: ['litCode'],
  properties: {
    litCode: {
      type: 'string',
      description: 'Generated Lit component code',
    },
  },
};

/**
 * JSON Schema for error responses (HTTP 400 and 500).
 * Provides error message and optional additional details.
 * @type {object}
 */
export const errorResponseSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'string',
      description: 'Error message',
    },
    details: {
      type: 'string',
      description: 'Additional error details',
    },
  },
};
