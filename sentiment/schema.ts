export default {
  $id: 'sentiment',
  type: 'object',
  required: ['tokens'],
  additionalItems: true,
  properties: {
    vocabulary: {
      enum: [
        'senticon',
        'pattern',
        'afinn',
      ],
    },
    tokens: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
  },
};
