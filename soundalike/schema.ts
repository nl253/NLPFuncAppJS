export default {
  $id: 'soundalike',
  type: 'object',
  required: ['text1', 'text2'],
  additionalItems: true,
  properties: {
    algorithm: {
      enum: [
        'SoundEx',
        'Metaphone',
        'DoubleMetaphone',
      ],
    },
    text1: {
      type: 'string',
    },
    text2: {
      type: 'string',
    },
  },
};
