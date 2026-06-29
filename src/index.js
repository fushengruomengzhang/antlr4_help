import { ParseError } from './parser/core/parse-error.js';
import { parse as jsonParse } from './parser/json/parse.js';
import { validate as json5Validate } from './parser/json5/validate.js';
import { parse as json5Parse } from './parser/json5/parse.js';
import { format as json5Format, DEFAULT_FORMAT_OPTIONS } from './parser/json5/format.js';
import { snowflakeId } from './parser/api/snowflake-id.js';
import { java8ToApiSchema } from './parser/api/java8/java8-to-api-schema.js';
import { firstClassName } from './parser/java8/first-class-name.js';
import { signatures } from './parser/java8/signatures.js';

export { ParseError, DEFAULT_FORMAT_OPTIONS };

export const JSON5 = {
  validate: json5Validate,
  parse: json5Parse,
  format: json5Format,
};

export const JSON4 = {
  parse: jsonParse,
};

export const JAVA8 = {
  firstClassName,
  signatures,
};

export const API = {
  snowflakeId,
  java8ToApiSchema,
};
