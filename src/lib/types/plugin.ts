export type Config = {
    cacheDir?: string;
    distDir?: string;
    prefix?: string;
    reservedNames?: string[];
    disableDistDeletion?: boolean;
    experimental?: {
        freedNamesPolicy?: "transmit" | "block";
        blockLimit?: number;
    };
};
