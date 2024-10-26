export type Config = {
    cacheDir?: string;
    distDir?: string;
    prefix?: string;
    reservedNames?: string[];
    distDeletionPolicy?: "warning" | "error" | "auto";
    experimental?: {
        syncFreedNames?: boolean;
        freedNamesLimit?: number;
    };
};
