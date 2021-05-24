import { ComponentDefinition } from '../shared/ComponentDefinition';
export interface Loader {
    supportsWebImport: boolean;
    supportsLocalImport: boolean;
    supportsDestructureImport: boolean;
    supportContentImport: boolean;
    webDestructureImport(pathContents: string, path: string, toImport: string[]): Map<string, string | ComponentDefinition>;
    webContentImport(pathContents: string, path: string): string;
    localDestructureImport(pathContents: string, path: string, toImport: string[]): Map<string, string | ComponentDefinition>;
    localContentImport(pathContents: string, path: string): string;
}
