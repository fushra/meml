import { BinaryExpr, DestructureExpr, ExprVisitor, GroupingExpr, IdentifierExpr, LiteralExpr, MemlPropertiesExpr, UnaryExpr } from '../parser/Expr';
import { ComponentStmt, ExportStmt, ExpressionStmt, ImportStmt, MemlStmt, PageStmt, StmtVisitor } from '../parser/Stmt';
import { Environment } from './shared/Environment';
export declare class Web implements ExprVisitor<string | number | boolean | null>, StmtVisitor<string> {
    environment: Environment;
    exports: Map<string, any>;
    path: string;
    constructor(path: string);
    visitDestructureExpr: (expr: DestructureExpr) => string | number | boolean;
    convert(token: PageStmt): string;
    visitExportStmt(stmt: ExportStmt): string;
    visitImportStmt(stmt: ImportStmt): string;
    visitMemlStmt(stmt: MemlStmt): string;
    visitExpressionStmt(stmt: ExpressionStmt): string;
    visitPageStmt(stmt: PageStmt): string;
    visitComponentStmt(stmt: ComponentStmt): string;
    visitIdentifierExpr(expr: IdentifierExpr): string | number | boolean;
    visitMemlPropertiesExpr(expr: MemlPropertiesExpr): string;
    visitLiteralExpr(expr: LiteralExpr): string | number | boolean | null;
    visitGroupingExpr(expr: GroupingExpr): string | number | boolean | null;
    visitUnaryExpr(expr: UnaryExpr): number | boolean | null;
    visitBinaryExpr(expr: BinaryExpr): number | boolean | string | null;
    private evaluate;
    private isTruthy;
    private isEqual;
}
