const marked = require('marked');

const {
  logStart,
  fail,
  succeed,
  validateJSON,
  TEXT_HEADER,
  CACHE_HEADER,
} = require('../lib');

module.exports = async (context, req) => {
  logStart(context);
  try {
    await validateJSON(context, {
      $id: __dirname,
      type: "string",
    });
    return succeed(context, marked(req.body), { ...TEXT_HEADER, ...CACHE_HEADER })
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
