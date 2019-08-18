const { basename } = require('path');

/**
 * @param {RegExp} regex
 * @param {String} str
 * @returns {Array<String>} results
 */
function findAll(str, regex) {
  const results = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    results.push(match);
  }
  return results;
}

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
 * @param {String} text
 * @param {RegExp} regex
 * @return {Record<String, String>}
 */
function getCounts(text, regex = /\w+/) {
  const counts = {};
  for (const w of findAll(text, regex)) {
    counts[w] = (counts[w] || 0) + 1;
  }
  return counts;
}

module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  if (req.body && req.body.text) {
    ok.body = JSON.stringify(getCounts(req.body.text, req.body.regex ? new RegExp(req.body.regex, "g") : /\w+/g));
    context.res = ok;
  } else {
    context.res = bad;
  }
};
