const nlp = require('compromise');

const { fail, succeed, validateJSON, logStart } = require('../lib');

const schema = {
  $id: __dirname,
  type: 'object',
  required: ['text', 'type'],
  properties: {
    text: {
      type: 'string',
    },
    type: {
      enum: [
        "abbreviations",
        "acronyms",
        "adverbs",
        "atMentions",
        "clauses",
        "conjunctions",
        "contractions",
        "emails",
        "hashTags",
        "hyphenated",
        "lists",
        "money",
        "nouns",
        "numbers",
        "organizations",
        "parenthesis",
        "people",
        "phoneNumbers",
        "places",
        "possessives",
        "prepositions",
        "pronouns",
        "quotations",
        "terms",
        "topics",
        "urls",
        "verbs",
      ]
    }
  }
};

module.exports = async (context, req) => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    return succeed(context, nlp(req.body.text)[req.body.type]().out('array'));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
