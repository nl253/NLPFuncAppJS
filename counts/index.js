const { logStart, succeed, fail, validateJSON } = require('../lib');

const schema = {
  $id: __dirname,
  type: 'object',
  required: ['text'],
  properties: {
    flags: {
      type: 'string',
    },
    text: {
      type: 'string',
    },
    regex: {
      type: 'string',
    },
  },
};

/**
 * @param {RegExp} regex
 * @param {string} str
 * @returns {string[]} results
 */
const findAll = (str, regex) => {
  const results = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    results.push(match[0]);
  }
  return results;
};

/**
 * @param {string} text
 * @param {RegExp} regex
 * @return {Record<string, string>}
 */
const getCounts = (text, regex) => {
  const counts = {};
  for (const w of findAll(text, regex)) {
    counts[w] = (counts[w] || 0) + 1;
  }
  return counts;
};

module.exports = async (context, req) => {
  logStart(context);
  try {
    await validateJSON(context, schema);
    const flags = req.body.flags || 'g';
    const regexFallback = /\w+/g;
    const regex = req.body.regex ? (new RegExp(req.body.regex, flags)) : regexFallback;
    const counts = getCounts(req.body.text, regex);
    return succeed(context, counts);
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
