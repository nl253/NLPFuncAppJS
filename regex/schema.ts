export default {
  $id: 'regex',
  type: 'object',
  required: ['text', 'regex'],
  properties: {
    text: {
      type: 'string',
    },
    regex: {
      type: 'string',
      minLength: 1,
    },
    flags: {
      type: 'string',
    },
  },
};
