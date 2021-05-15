import { Token } from '../../scanner/Token';
import { DestructureExpr, ExprVisitor } from '../../parser/Expr';
import { IStmt, StmtVisitor } from '../../parser/Stmt';
export declare class ComponentDefinition {
    private props;
    private meml;
    private name;
    constructor(props: DestructureExpr, meml: IStmt, name: string);
    propsList(): Token[];
    construct(visitor: ExprVisitor<any> & StmtVisitor<any>): string;
}
