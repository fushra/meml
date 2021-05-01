export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN = 'leftParen',
  RIGHT_PAREN = 'rightParen',
  MINUS = 'minus',
  PLUS = 'plus',
  SLASH = 'slash',
  STAR = 'star',
  COMMA = 'comma',

  // One or two character tokens.
  BANG = 'bang',
  BANG_EQUAL = 'bangEqual',
  EQUAL = 'equal',
  EQUAL_EQUAL = 'equalEqual',
  GREATER = 'greater',
  GREATER_EQUAL = 'greaterEqual',
  LESS = 'less',
  LESS_EQUAL = 'lessEqual',

  // Literals.
  IDENTIFIER = 'identifier',
  STRING = 'string',
  NUMBER = 'number',
  TAG = 'tag',
  FALSE = 'false',
  TRUE = 'true',
  NULL = 'null',

  // Keywords
  COMPONENT = 'component',
  EXPORT = 'export',
  IMPORT = 'import',
  FROM = 'from',

  EOF = 'eof',
}
