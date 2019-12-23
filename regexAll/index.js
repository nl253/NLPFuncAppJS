const { logStart, succeed, fail, validateJSON } = require('../lib');

const schema = {
  $id: __dirname,
  type: 'object',
  required: ['text', 'regex'],
  properties: {
    text: {
      type: 'string',
      minLength: 1,
    },
    regex: {
      type: 'string',
      minLength: 1,
    },
    flags: {
      type: 'string',
      minLength: 1,
    }
  }
};

/**
 * @param {RegExp} regex
 * @param {string} str
 * @returns {string[]} results
 */
const findAll = (regex, str) => {
  const results = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    results.push(match[0]);
  }
  return results;
};

module.exports = async (context, req) => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    const flags = new Set(['g']);
    if (req.body.flags) {
      for (let i = 0; i < req.body.flags.length; i++) {
        flags.add(req.body.flags[i]);
      }
    }
    const regExp = new RegExp(req.body.regex, Array.from(flags).join(''));
    return succeed(context, findAll(regExp, req.body.text))
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
