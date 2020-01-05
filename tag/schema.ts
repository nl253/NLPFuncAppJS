export default {
  $id: 'tag',
  type: 'object',
  required: ['tokens'],
  additionalItems: true,
  properties: {
    tokens: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    defaultCategoryCapitalized: {
      type: 'string',
      minLength: 1,
    },
    defaultCategory: {
      type: 'string',
      minLength: 1,
    },
    language: {
      type: 'string',
      minLength: 1,
    },
  },
};
