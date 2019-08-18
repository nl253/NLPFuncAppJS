const { basename } = require('path');

const ok = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
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
 * @param {String} str
 * @returns {Array<String>} results
 */
function findAll(regex, str) {
  const results = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    results.push(match);
  }
  return results;
}


module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  const flags = new Set();
  flags.add('g');
  if (req.body.flags) {
    req.body.flags.forEach(f => flags.add(f));
  }

  if (req.body && req.body.text && req.body.regex) {
    const regExp  = new RegExp(req.body.regex, Array.from(flags).join(""));
    const results = findAll(regExp, req.body.text);
    ok.body     = JSON.stringify(results);
    context.res = ok;
  } else {
    context.res = bad;
  }
};
