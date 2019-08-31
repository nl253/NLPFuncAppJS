const marked = require('marked');
const { basename } = require('path');

const ok = {
  status: 200,
  headers: {
    'Content-Type': 'text/html',
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


module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  if (req.body) {
    ok.body = marked(req.body);
    context.res = ok;
  } else {
    context.res = bad;
  }
};
