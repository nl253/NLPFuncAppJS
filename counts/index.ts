import {fail, logStart, Response, succeed, validateJSON} from "../lib";

import {Context, HttpRequest} from "@azure/functions";
import * as schema from "./schema";

const findAll = (str: string, regex: RegExp): string[] => {
  const results = [];
  let match;
  // tslint:disable-next-line:no-conditional-assignment
  while ((match = regex.exec(str)) !== null) {
    results.push(match[0]);
  }
  return results;
};

const getCounts = (text: string, regex: RegExp): Record<string, number> => {
  const counts = {};
  for (const w of findAll(text, regex)) {
    counts[w] = (counts[w] || 0) + 1;
  }
  return counts;
};

export default async (context: Context, req: HttpRequest): Promise<Response> => {
  logStart(context);
  try {
    await validateJSON(context, schema);
    const flags = Array.from(new Set(Array.from((req.body.flags || "") + "g"))).join("");
    const regexFallback = /\w+/g;
    const regex = req.body.regex ? (new RegExp(req.body.regex, flags)) : regexFallback;
    const counts = getCounts(req.body.text, regex);
    return succeed(context, counts);
  } catch (e) {
    return fail(context, e.message, e.code);
  }
};
