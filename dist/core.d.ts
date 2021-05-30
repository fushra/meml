import { Token } from './scanner/Token';
import { PageStmt } from './parser/Stmt';
import { ILoader } from './targets/loaders/ILoader';
export declare class MemlCore {
    static hadError: boolean;
    static errors: string;
    static globalLoaders: ILoader[];
    static isProduction: boolean;
    tokenize(source: string, file?: string): Token[];
    parse(tokens: Token[], file?: string): PageStmt;
    targetWeb(page: PageStmt, path?: string): Promise<string>;
    tokenizeAndParse(source: string, file?: string): PageStmt;
    sourceToWeb(source: string, path?: string): Promise<string>;
    fileToWeb(path: string): Promise<string>;
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
