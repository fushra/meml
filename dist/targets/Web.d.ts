import { BinaryExpr, DestructureExpr, ExprVisitor, GroupingExpr, IdentifierExpr, LiteralExpr, MemlPropertiesExpr, UnaryExpr } from '../parser/Expr';
import { ComponentStmt, ExportStmt, ExpressionStmt, ImportStmt, MemlStmt, PageStmt, StmtVisitor } from '../parser/Stmt';
import { Environment } from './shared/Environment';
export declare class Web implements ExprVisitor<Promise<string | number | boolean | null>>, StmtVisitor<Promise<string>> {
    environment: Environment;
    exports: Map<string, any>;
    path: string;
    constructor(path: string);
    visitDestructureExpr: (expr: DestructureExpr) => Promise<string | number | boolean>;
    convert(token: PageStmt): Promise<string>;
    visitExportStmt(stmt: ExportStmt): Promise<string>;
    visitImportStmt(stmt: ImportStmt): Promise<string>;
    visitMemlStmt(stmt: MemlStmt): Promise<string>;
    visitExpressionStmt(stmt: ExpressionStmt): Promise<string>;
    visitPageStmt(stmt: PageStmt): Promise<string>;
    visitComponentStmt(stmt: ComponentStmt): Promise<string>;
    visitIdentifierExpr(expr: IdentifierExpr): Promise<string | number | boolean>;
    visitMemlPropertiesExpr(expr: MemlPropertiesExpr): Promise<string>;
    visitLiteralExpr(expr: LiteralExpr): Promise<string | number | boolean | null>;
    visitGroupingExpr(expr: GroupingExpr): Promise<string | number | boolean | null>;
    visitUnaryExpr(expr: UnaryExpr): Promise<number | boolean | null>;
    visitBinaryExpr(expr: BinaryExpr): Promise<number | boolean | string | null>;
    private evaluate;
    private isTruthy;
    private isEqual;
}
