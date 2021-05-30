import { Token } from '../../scanner/Token';
import { ComponentDefinition } from '../shared/ComponentDefinition';
import { ILoader } from './ILoader';
export declare class MemlLoader implements ILoader {
    supportsWebImport: boolean;
    supportsLocalImport: boolean;
    supportsDestructureImport: boolean;
    supportContentImport: boolean;
    fileMatch: RegExp;
    name: string;
    webDestructureImport(pathContents: string, path: string, toImport: Token[]): Promise<Map<string, string | ComponentDefinition>>;
    webContentImport(pathContents: string, path: string): Promise<string>;
    localDestructureImport(pathContents: string, path: string, toImport: Token[]): Promise<Map<string, string | ComponentDefinition>>;
    localContentImport(pathContents: string, path: string): Promise<string>;
}
