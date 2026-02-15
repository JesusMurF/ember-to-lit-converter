export const convertRequestSchema = {
  type: 'object',
  required: ['code'],
  properties: {
    code: {
      type: 'string',
      minLength: 1,
      maxLength: 102400, // 100KB limit
      description: 'Ember component JavaScript code to convert'
    }
  }
};

export const convertResponseSchema = {
  type: 'object',
  required: ['litCode'],
  properties: {
    litCode: {
      type: 'string',
      description: 'Generated Lit component code'
    }
  }
};

export const errorResponseSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'string',
      description: 'Error message'
    },
    details: {
      type: 'string',
      description: 'Additional error details'
    }
  }
};
