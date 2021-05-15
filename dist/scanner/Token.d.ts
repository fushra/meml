import { TokenType } from './TokenTypes';
export declare class Token {
    type: TokenType;
    lexeme: string;
    literal: any;
    line: number;
    context: string;
    constructor(type: TokenType, lexeme: string, literal: any, line: number, context: string);
    toString(): string;
}
