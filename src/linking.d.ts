import type { URLListener } from './linking.types';
export declare function createURL(path?: string, options?: {
    scheme?: string;
    path?: string;
    queryParams?: Record<string, string>;
}): string;
export declare function getInitialURL(): Promise<string | null>;
export declare function addEventListener(type: 'url', listener: URLListener): {
    remove: () => void;
};
export declare function removeEventListener(type: 'url', listener: URLListener): void;
//# sourceMappingURL=linking.d.ts.map