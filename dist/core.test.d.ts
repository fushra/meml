export declare class MemlCTests {
    construct(): void;
    runFile(): void;
    parser(source: string, out: string): void;
    full(source: string, out: string): Promise<void>;
}
