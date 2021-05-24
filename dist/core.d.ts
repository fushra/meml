import { Token } from './scanner/Token';
import { PageStmt } from './parser/Stmt';
export declare class MemlCore {
    static hadError: boolean;
    static errors: string;
    tokenize(source: string, file?: string): Token[];
    parse(tokens: Token[], file?: string): PageStmt;
    targetWeb(page: PageStmt, path?: string): string;
    tokenizeAndParse(source: string, file?: string): PageStmt;
    sourceToWeb(source: string, path?: string): string;
    fileToWeb(path: string): string;
    static resetErrors(): void;
    static errorAtToken(token: Token, message: string, file?: string): void;
    static error(line: number, message: string, file?: string): void;
    static linterAtToken(token: Token, message: string): void;
    static generalWarning(line: number, message: string): void;
    private static report;
    private static warn;
    private static formatContext;
}
export declare class MemlC extends MemlCore {
    constructor();
}
