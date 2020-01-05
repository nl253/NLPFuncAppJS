export default {
  $id: 'ngrams',
  type: 'object',
  additionalItems: true,
  properties: {
    n: {
      type: 'number',
    },
    tokens: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    text: {
      type: 'string',
      minLength: 1,
    },
  },
};
