import { Context } from '@azure/functions';
import * as Ajv from 'ajv';

type Headers = Record<string, string>;
type Response = any;
type Logger = { warn(...xs: any[]): void; log(...xs: any[]): void; error(...xs: any[]): void };

const JSON_HEADER = {
  'Content-Type': 'application/json',
};

const TEXT_HEADER = {
  'Content-Type': 'text/plain',
};

const HTML_HEADER = {
  'Content-Type': 'text/html',
};

const CACHE_HEADER = {
  'Cache-Control': 'private, immutable',
};

const HTTP_ERR = {
  USER_ERR: 400,
  NOT_FOUND: 404,
};

class APIError extends Error {
  public readonly code: number;

  constructor(msg = 'something went wrong', code: number = HTTP_ERR.USER_ERR) {
    super(msg);
    this.code = code;
  }
}

const logStart = (context: Context): void => {
  context.log('[Node.js HTTP %s FuncApp] %s', context.req.method, context.req.url);
  context.log('body %s', context.req.body ? JSON.stringify(context.req.body).substr(0, 200) : 'undefined');
  context.log('query %s', JSON.stringify(context.req.query).substr(0, 200));
};

const makeLogger: (context: Context) => Logger = (context: Context) => ({
  log(...xs: any[]): void {
    return context.log(...xs);
  },
  warn(...xs: any[]): void {
    return context.log.warn(...xs);
  },
  error(...xs: any[]): void {
    return context.log.error(...xs);
  },
});

const succeed = (
  context: Context,
  body: any,
  headers: Headers = { ...CACHE_HEADER, ...JSON_HEADER },
  status = 200,
): Response => {
  // eslint-disable-next-line no-param-reassign
  context.res = {
    body: (headers['Content-Type'] || '').indexOf('/json') >= 0 || headers['Content-Type'] === undefined
      ? JSON.stringify(body)
      : body,
    status,
    headers,
  };
};

const fail = (
  context: Context,
  msg: string,
  status = 400,
  headers: Headers = { ...TEXT_HEADER },
): Response => {
  // eslint-disable-next-line no-param-reassign
  context.res = {
    status,
    headers,
    body: msg,
  };
};

const validateJSON = (context: Context, schema: Record<string, any>, what: 'body' | 'query' = 'body'): void => {
  if (context.req[what] === null || context.req[what] === undefined) {
    throw new APIError(`${what} is missing from the request`, HTTP_ERR.USER_ERR);
  }
  const validate = new Ajv({
    allErrors: true,
    logger: makeLogger(context),
    messages: true,
    unicode: false,
    verbose: true,
  }).compile({
    $id: schema.$id || schema.description,
    $schema: 'http://json-schema.org/draft-07/schema#',
    description: schema.description || schema.$id,
    ...schema,
  });
  const valid = validate(context.req[what]);
  if (!valid) {
    context.log(validate);
    context.log(validate.errors[0].params);
    throw new APIError(validate.errors.map((e) => `${e.dataPath} ${e.message} ${e.params ? JSON.stringify(e.params) : ''}`).join(', '), HTTP_ERR.USER_ERR);
  }
};

export {
  Headers,
  Response,
  HTTP_ERR,
  TEXT_HEADER,
  JSON_HEADER,
  HTML_HEADER,
  CACHE_HEADER,
  logStart,
  fail,
  succeed,
  validateJSON,
  APIError,
};
