const { basename } = require('path');

const ok = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, immutable',
  },
};

const bad = {
  status: 400,
  headers: {
    'Content-Type': 'text/plain',
  },
  body: 'Please pass text in the request body',
};

/**
 * @param {RegExp} regex
 * @param {string} str
 * @returns {string[]} results
 */
function findAll(regex, str) {
  const results = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    results.push(match[0]);
  }
  return results;
}

module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  /** @type {Set<string>} */
  const flags = new Set(['g']);
  if (req.body.flags) {
    req.body.flags.forEach(f => flags.add(f));
  }

  if (req.body && req.body.text && req.body.regex) {
    const regExp  = new RegExp(req.body.regex, Array.from(flags).join(''));
    const results = findAll(regExp, req.body.text);
    ok.body       = JSON.stringify(results);
    context.res   = ok;
  } else {
    context.res = bad;
  }
};
