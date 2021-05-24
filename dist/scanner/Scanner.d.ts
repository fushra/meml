import { Token } from './Token';
export declare class Scanner {
    private source;
    private file;
    private tokens;
    private start;
    private current;
    private line;
    constructor(source: string, file?: string);
    scanTokens(): Token[];
    private scanToken;
    private isAlpha;
    private isAlphaNumeric;
    private identifier;
    private number;
    private isDigit;
    private string;
    private peekNext;
    private peek;
    private peekLast;
    private match;
    private advance;
    private addToken;
    private isAtEnd;
}
