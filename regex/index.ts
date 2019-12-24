import {fail, logStart, succeed, validateJSON} from '../lib';

import * as schema from './schema';

module.exports = async function (context, req) {
  logStart(context);

  try {
    await validateJSON(context, schema);
    const flagSet = new Set(['g'].concat(Array.from(req.body.flags || '')));
    const flags = Array.from(flagSet).join('');
    const regex = new RegExp(req.body.regex, flags);
    return succeed(context, regex.exec(req.body.text));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
