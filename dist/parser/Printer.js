"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstPrinter = void 0;
class AstPrinter {
    print(expr) {
        return expr.accept(this);
    }
    parenthesize(name, ...exprs) {
        let final = `(${name}`;
        exprs.forEach((expr) => {
            final += ` ${expr.accept(this)}`;
        });
        final += ')';
        return final;
    }
    visitMemlPropertiesExpr(expr) {
        return this.parenthesize('Properties ' + expr.name, expr.value);
    }
    visitDestructureExpr(expr) {
        return `(Destructure ${expr.items.map((item) => `${item.literal},`)})`;
    }
    visitIdentifierExpr(expr) {
        return `(Identifier ${expr.token.literal})`;
    }
    visitComponentStmt(stmt) {
        return this.parenthesize('Component ' + stmt.tagName, stmt.props, stmt.meml);
    }
    visitExportStmt(stmt) {
        return this.parenthesize('Export', stmt.exports);
    }
    visitImportStmt(stmt) {
        return this.parenthesize('Import from ' + stmt.file, stmt.imports);
    }
    visitMemlStmt(stmt) {
        return this.parenthesize(stmt.tagName.literal, ...stmt.props, ...stmt.exprOrMeml);
    }
    visitExpressionStmt(stmt) {
        return this.parenthesize('expression', stmt.expression);
    }
    visitPageStmt(stmt) {
        return this.parenthesize('page', ...stmt.children);
    }
    visitBinaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }
    visitGroupingExpr(expr) {
        return this.parenthesize('group', expr.expression);
    }
    visitLiteralExpr(expr) {
        if (typeof expr.value == 'undefined')
            return 'null';
        return expr.value.toString();
    }
    visitUnaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }
}
exports.AstPrinter = AstPrinter;
//# sourceMappingURL=Printer.js.map