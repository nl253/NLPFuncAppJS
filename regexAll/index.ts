import {Context, HttpRequest} from "@azure/functions";

import {fail, logStart, Response, succeed, validateJSON} from "../lib";

import * as schema from "./schema";

const findAll = (regex: RegExp, str: string): string[] => {
  const results = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    results.push(match[0]);
  }
  return results;
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);

  try {
    await validateJSON(context, schema);
    const flagSet = new Set(["g"].concat(Array.from(req.body.flags || "")));
    const flags = Array.from(flagSet).join("");
    const regExp = new RegExp(req.body.regex, flags);
    return succeed(context, findAll(regExp, req.body.text));
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
