export default {
  $id: 'stem',
  type: 'object',
  required: ['tokens'],
  additionalItems: true,
  properties: {
    stemmer: {
      enum: [
        null,
        'LancasterStemmer',
        'PorterStemmer',
      ],
    },
    tokens: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};
