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
    'Cache-Control': 'private, immutable'
  },
  body: 'Please pass text and regex in the request body',
};

module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  if (req.body && req.body.text && req.body.regex) {
    /** @type {Set<string>} */
    const flags = new Set(['g']);
    if (req.body.flags) {
      req.body.flags.forEach(f => flags.add(f));
    }
    const regex = new RegExp(req.body.regex, Array.from(flags).join(''));
    /** @type {string[]} */
    const match = regex.exec(req.body.text);
    ok.body     = JSON.stringify(match);
    context.res = ok;
  } else {
    context.res = bad;
  }
};
