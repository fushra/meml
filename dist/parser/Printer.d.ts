import { BinaryExpr, GroupingExpr, LiteralExpr, UnaryExpr, ExprVisitor, DestructureExpr, IdentifierExpr, MemlPropertiesExpr } from './Expr';
import { ComponentStmt, ExportStmt, ExpressionStmt, ImportStmt, MemlStmt, PageStmt, StmtVisitor } from './Stmt';
export declare class AstPrinter implements ExprVisitor<string>, StmtVisitor<string> {
    print(expr: any): string;
    private parenthesize;
    visitMemlPropertiesExpr(expr: MemlPropertiesExpr): string;
    visitDestructureExpr(expr: DestructureExpr): string;
    visitIdentifierExpr(expr: IdentifierExpr): string;
    visitComponentStmt(stmt: ComponentStmt): string;
    visitExportStmt(stmt: ExportStmt): string;
    visitImportStmt(stmt: ImportStmt): string;
    visitMemlStmt(stmt: MemlStmt): string;
    visitExpressionStmt(stmt: ExpressionStmt): string;
    visitPageStmt(stmt: PageStmt): string;
    visitBinaryExpr(expr: BinaryExpr): string;
    visitGroupingExpr(expr: GroupingExpr): string;
    visitLiteralExpr(expr: LiteralExpr): string;
    visitUnaryExpr(expr: UnaryExpr): string;
}
