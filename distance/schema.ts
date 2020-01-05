export default {
  $id: 'distance',
  type: 'object',
  required: ['text1', 'text2'],
  additionalItems: true,
  properties: {
    metric: {
      enum: [
        'DamerauLevenshteinDistance',
        'DiceCoefficient',
        'JaroWinklerDistance',
        'LevensteinDistance',
      ],
    },
    text1: {
      type: 'string',
      minLength: 1,
    },
    text2: {
      type: 'string',
      minLength: 1,
    },
  },
};
