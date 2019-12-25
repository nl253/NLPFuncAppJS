import {promises as fs} from 'fs';

import {join} from 'path';

import {APIError, fail, logStart, succeed, validateJSON} from '../lib';

import * as definitions from './dict.json';

import * as schema from './schema';

/**
 * @param {{log: function(...*)}} context
 * @param {string} word
 * @returns {Promise<string>} word
 */
const tryDefine = async (context, word) => {
  context.log(`defining ${word}`);
  const normalized = word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();
  const wordNotPlural = normalized.replace(/s$/, '');
  const wordNotPlural2 = normalized.replace(/es$/, '');
  const wordNotGerund = normalized.replace(/ing$/, '');
  const wordNotGerund2 = normalized.replace(/ing$/, 'e');
  const wordNotPastTense = normalized.replace(/ed$/, '');
  const wordNotPastTense2 = normalized.replace(/ed$/, 'e');
  const wordNotAdjective = normalized.replace(/ly$/, '');

  context.log('checking regular dict');

  for (const w of [word, normalized, wordNotPlural, wordNotPlural2, wordNotGerund, wordNotGerund2, wordNotPastTense, wordNotPastTense2, wordNotAdjective]) {
    const definition = definitions[w];
    if (definition) {
      context.log(`found definition ${JSON.stringify(definition)}`);
      return definition;
    }
  }

  context.log('checking technical dict');

  const dictTechnical = await fs.readFile(join(__dirname, 'dict-technical.txt'), { encoding: 'utf-8' });
  for (const w of [word, normalized, wordNotPlural, wordNotPlural2, wordNotGerund, wordNotGerund2, wordNotPastTense, wordNotPastTense2, wordNotAdjective]) {
    const m = dictTechnical.match(new RegExp(`^${w}\\n\\n\\t(.*?)\\n\\n^(?=\\S)`, 'ms'));
    if (m) {
      const definition = m[1];
      context.log(`found definition ${definition}`);
      return definition;
    }
  }

  throw new APIError('failed to find a definition', 404);
};

/**
 * @param {{log: function(...*), res: *}} context
 * @param {{body: {word: string}}} req
 * @return {Promise<{message: string, status: number}|{definition: string}>}
 */
export default async (context, req) => {
  logStart(context);
  try {
    await validateJSON(context, schema);
    return succeed(context, {definition: await tryDefine(context, req.body.word)});
  } catch (e) {
    return fail(context, e.message, e.code)
  }
}
