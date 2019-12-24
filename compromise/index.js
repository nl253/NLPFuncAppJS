const nlp = require('compromise');

const { fail, succeed, validateJSON, logStart } = require('../lib');

module.exports = async (context, req) => {
  logStart(context);

  try {
    await validateJSON(context, __filename);
    return succeed(context, nlp(req.body.text)[req.body.type]().out('array'));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
