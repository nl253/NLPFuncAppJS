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
const getCounts = (text, regex = /\w+/) => {
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
    return succeed(context, getCounts(req.body.text, req.body.regex ? new RegExp(req.body.regex, req.body.flags || 'g') : /\w+/g));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
