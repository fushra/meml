"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifierExpr = exports.DestructureExpr = exports.MemlPropertiesExpr = exports.UnaryExpr = exports.LiteralExpr = exports.GroupingExpr = exports.BinaryExpr = void 0;
class BinaryExpr {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}
exports.BinaryExpr = BinaryExpr;
class GroupingExpr {
    constructor(expression) {
        this.expression = expression;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitGroupingExpr(this);
    }
}
exports.GroupingExpr = GroupingExpr;
class LiteralExpr {
    constructor(value) {
        this.value = value;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}
exports.LiteralExpr = LiteralExpr;
class UnaryExpr {
    constructor(operator, right) {
        this.operator = operator;
        this.right = right;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}
exports.UnaryExpr = UnaryExpr;
class MemlPropertiesExpr {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitMemlPropertiesExpr(this);
    }
}
exports.MemlPropertiesExpr = MemlPropertiesExpr;
class DestructureExpr {
    constructor(items) {
        this.items = items;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitDestructureExpr(this);
    }
}
exports.DestructureExpr = DestructureExpr;
class IdentifierExpr {
    constructor(token) {
        this.token = token;
    }
    // Visitor pattern
    accept(visitor) {
        return visitor.visitIdentifierExpr(this);
    }
}
exports.IdentifierExpr = IdentifierExpr;
//# sourceMappingURL=Expr.js.map