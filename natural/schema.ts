export default {
  $id: 'natural',
  type: 'object',
  required: ['action'],
  additionalItems: true,
  properties: {
    action: {
      enum: [
        'soundalike',
        'tag',
        'distance',
        'match',
        'sentiment',
        'stem',
        'tokenize',
      ],
    },
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
    algorithm: {
      enum: [
        'SoundEx',
        'Metaphone',
        'DoubleMetaphone',
      ],
    },
    stemmer: {
      enum: [
        null,
        'LancasterStemmer',
        'PorterStemmer',
      ],
    },
    metric: {
      enum: [
        'DamerauLevenshteinDistance',
        'DiceCoefficient',
        'JaroWinklerDistance',
        'LevensteinDistance',
      ],
    },
    vocabulary: {
      enum: [
        'senticon',
        'pattern',
        'afinn',
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
    text1: {
      type: 'string',
      minLength: 1,
    },
    text2: {
      type: 'string',
      minLength: 1,
    },
    text: {
      type: 'string',
      minLength: 1,
    },
  },
};
