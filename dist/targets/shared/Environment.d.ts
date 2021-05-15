import { Token } from '../../scanner/Token';
export declare class Environment {
    enclosing: Environment;
    private values;
    constructor(enclosing?: Environment);
    define(name: string, value: any): void;
    assign(name: Token, value: any): void;
    get(name: Token): unknown | void;
}
