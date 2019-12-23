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
    const flags = new Set(['g']);
    if (req.body.flags) {
      for (let i = 0; i < req.body.flags.length; i++) {
        flags.add(req.body.flags[i]);
      }
    }
    const regex = new RegExp(req.body.regex, Array.from(flags).join(''));
    return succeed(context, regex.exec(req.body.text));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
