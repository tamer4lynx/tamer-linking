export interface ParsedURL {
    scheme: string | null;
    hostname: string | null;
    path: string | null;
    queryParams: Record<string, string> | null;
}
export type URLListener = (event: {
    url: string;
}) => void;
export interface CreateURLOptions {
    scheme?: string;
    path?: string;
    queryParams?: Record<string, string>;
}
//# sourceMappingURL=linking.types.d.ts.map