import { Token } from './scanner/Token';
export declare class MemlC {
    static hadError: boolean;
    static errors: string;
    runFile(path: string): boolean;
    run(source: string): string;
    parseFile(path: string): import("./parser/Stmt").PageStmt;
    parse(source: string): import("./parser/Stmt").PageStmt;
    translate(source: string, path: string): string;
    private sleep;
    static errorAtToken(token: Token, message: string): void;
    static error(line: number, message: string): void;
    static linterAtToken(token: Token, message: string): void;
    private static report;
    private static warn;
    private static formatContext;
}
