import { Token } from '../scanner/Token';
export interface ExprVisitor<R> {
    visitBinaryExpr: (expr: BinaryExpr) => R;
    visitGroupingExpr: (expr: GroupingExpr) => R;
    visitLiteralExpr: (expr: LiteralExpr) => R;
    visitUnaryExpr: (expr: UnaryExpr) => R;
    visitMemlPropertiesExpr: (expr: MemlPropertiesExpr) => R;
    visitDestructureExpr: (expr: DestructureExpr) => R;
    visitIdentifierExpr: (expr: IdentifierExpr) => R;
}
export interface IExpr {
    accept: <R>(visitor: ExprVisitor<R>) => R;
}
export declare class BinaryExpr implements IExpr {
    left: IExpr;
    operator: Token;
    right: IExpr;
    constructor(left: IExpr, operator: Token, right: IExpr);
    accept<R>(visitor: ExprVisitor<R>): R;
}
export declare class GroupingExpr implements IExpr {
    expression: IExpr;
    constructor(expression: IExpr);
    accept<R>(visitor: ExprVisitor<R>): R;
}
export declare class LiteralExpr implements IExpr {
    value: any;
    constructor(value: any);
    accept<R>(visitor: ExprVisitor<R>): R;
}
export declare class UnaryExpr implements IExpr {
    operator: Token;
    right: IExpr;
    constructor(operator: Token, right: IExpr);
    accept<R>(visitor: ExprVisitor<R>): R;
}
export declare class MemlPropertiesExpr implements IExpr {
    name: Token;
    value: IExpr;
    constructor(name: Token, value: IExpr);
    accept<R>(visitor: ExprVisitor<R>): R;
}
export declare class DestructureExpr implements IExpr {
    items: Token[];
    constructor(items: Token[]);
    accept<R>(visitor: ExprVisitor<R>): R;
}
export declare class IdentifierExpr implements IExpr {
    token: Token;
    constructor(token: Token);
    accept<R>(visitor: ExprVisitor<R>): R;
}
