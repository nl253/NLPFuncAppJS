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


module.exports = async function (context, req) {
  context.log('[Node.js HTTP %s FuncApp] %s', basename(__dirname), req.originalUrl);

  if (req.body && req.body.text && req.body.regex) {
    const regex = new RegExp(req.body.regex);
    const match = regex.exec(req.body.text);
    ok.body = JSON.stringify(match);
    context.res = ok;
  } else {
    context.res = bad;
  }
};
