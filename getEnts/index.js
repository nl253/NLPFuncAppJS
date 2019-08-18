const { basename } = require('path');
const nlp = require('compromise');

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

  if (req.body && req.body.text) {
    ok.body = JSON.stringify(nlp(req.body.text).people().data());
    context.res = ok;
  } else {
    context.res = bad;
  }
};
