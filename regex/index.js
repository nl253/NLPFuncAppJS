const { succeed, fail, logStart, validateJSON } = require('../lib');

module.exports = async function (context, req) {
  logStart(context);

  try {
    await validateJSON(context, {
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
    });
    const flagSet = new Set(['g', ...(req.body.flags || '')]);
    const flags = Array.from(flagSet).join('');
    const regex = new RegExp(req.body.regex, flags);
    return succeed(context, regex.exec(req.body.text));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
