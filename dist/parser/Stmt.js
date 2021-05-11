"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageStmt = exports.ExpressionStmt = exports.MemlStmt = exports.ImportStmt = exports.ExportStmt = exports.ComponentStmt = void 0;
class ComponentStmt {
    constructor(tagName, props, meml) {
        this.tagName = tagName;
        this.props = props;
        this.meml = meml;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitComponentStmt(this);
    }
}
exports.ComponentStmt = ComponentStmt;
class ExportStmt {
    constructor(exports, exportToken) {
        this.exports = exports;
        this.exportToken = exportToken;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitExportStmt(this);
    }
}
exports.ExportStmt = ExportStmt;
class ImportStmt {
    constructor(file, fileToken, imports) {
        this.file = file;
        this.fileToken = fileToken;
        this.imports = imports;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitImportStmt(this);
    }
}
exports.ImportStmt = ImportStmt;
class MemlStmt {
    constructor(tagName, props, exprOrMeml) {
        this.tagName = tagName;
        this.props = props;
        this.exprOrMeml = exprOrMeml;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitMemlStmt(this);
    }
}
exports.MemlStmt = MemlStmt;
class ExpressionStmt {
    constructor(expression) {
        this.expression = expression;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitExpressionStmt(this);
    }
}
exports.ExpressionStmt = ExpressionStmt;
class PageStmt {
    constructor(children) {
        this.children = children;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitPageStmt(this);
    }
}
exports.PageStmt = PageStmt;
//# sourceMappingURL=Stmt.js.map