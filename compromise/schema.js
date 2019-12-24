module.exports = {
  "$id": "compromise",
  "type": "object",
  "required": ["text", "type"],
  "properties": {
    "text": {
      "type": "string",
      "minLength": 1
    },
    "type": {
      "enum": [
        "abbreviations",
        "acronyms",
        "adverbs",
        "atMentions",
        "clauses",
        "conjunctions",
        "contractions",
        "hashTags",
        "hyphenated",
        "nouns",
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
        "verbs"
      ]
    }
  }
};
