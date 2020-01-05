export default {
  $id: 'tokenize',
  type: 'object',
  required: ['text'],
  additionalItems: true,
  properties: {
    tokenizer: {
      enum: [
        'OrthographyTokenizer',
        'RegexpTokenizer',
        'CaseTokenizer',
        'AggressiveTokenizer',
        'SentenceTokenizer',
        'TreebankWordTokenizer',
        'WordPunctTokenizer',
        'WordTokenizer',
      ],
    },
    flags: {
      type: 'string',
      minLength: 1,
    },
    regex: {
      type: 'string',
      minLength: 1,
    },
    text: {
      type: 'string',
      minLength: 1,
    },
  },
};
