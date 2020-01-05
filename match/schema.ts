export default {
  $id: 'match',
  type: 'object',
  required: ['text1', 'text2'],
  additionalItems: true,
  properties: {
    text1: {
      type: 'string',
    },
    text2: {
      type: 'string',
    },
  },
};
