import { Token } from '../scanner/Token';
import { IExpr, MemlPropertiesExpr, DestructureExpr } from './Expr';
export interface StmtVisitor<R> {
    visitComponentStmt: (stmt: ComponentStmt) => R;
    visitExportStmt: (stmt: ExportStmt) => R;
    visitImportStmt: (stmt: ImportStmt) => R;
    visitMemlStmt: (stmt: MemlStmt) => R;
    visitExpressionStmt: (stmt: ExpressionStmt) => R;
    visitPageStmt: (stmt: PageStmt) => R;
}
export interface IStmt {
    accept: <R>(visitor: StmtVisitor<R>) => R;
}
export declare class ComponentStmt implements IStmt {
    tagName: Token;
    props: DestructureExpr;
    meml: IStmt;
    constructor(tagName: Token, props: DestructureExpr, meml: IStmt);
    accept<R>(visitor: StmtVisitor<R>): R;
}
export declare class ExportStmt implements IStmt {
    exports: DestructureExpr;
    exportToken: Token;
    constructor(exports: DestructureExpr, exportToken: Token);
    accept<R>(visitor: StmtVisitor<R>): R;
}
export declare class ImportStmt implements IStmt {
    file: string;
    fileToken: Token;
    imports: DestructureExpr | null | 'everything';
    constructor(file: string, fileToken: Token, imports: DestructureExpr | null | 'everything');
    accept<R>(visitor: StmtVisitor<R>): R;
}
export declare class MemlStmt implements IStmt {
    tagName: Token;
    props: MemlPropertiesExpr[];
    exprOrMeml: IStmt[];
    constructor(tagName: Token, props: MemlPropertiesExpr[], exprOrMeml: IStmt[]);
    accept<R>(visitor: StmtVisitor<R>): R;
}
export declare class ExpressionStmt implements IStmt {
    expression: IExpr;
    constructor(expression: IExpr);
    accept<R>(visitor: StmtVisitor<R>): R;
}
export declare class PageStmt implements IStmt {
    children: IStmt[];
    constructor(children: IStmt[]);
    accept<R>(visitor: StmtVisitor<R>): R;
}
