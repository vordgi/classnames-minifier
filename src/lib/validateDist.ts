import path from "path";
import fs from "fs";
import type { Config } from "./types/plugin";
import { CODE_VERSION } from "./constants/configuration";

const readManifest = (manifestPath: string) => {
    try {
        const prevData = fs.readFileSync(manifestPath, { encoding: "utf-8" });
        return JSON.parse(prevData) as Config & { version?: string };
    } catch {
        return {} as Partial<Config & { version?: string }>;
    }
};

const validateDist = (pluginOptions: Config) => {
    const { cacheDir, distDir, prefix, reservedNames, disableDistDeletion } = pluginOptions;

    if (!cacheDir || !distDir) {
        console.log(
            "classnames-minifier: Failed to check the dist folder because cacheDir or distDir is not specified",
        );
        return;
    }

    const manifestDir = path.join(cacheDir, "ncm-meta");
    const manifestPath = path.join(manifestDir, "manifest.json");
    let configurationError = "";

    if (fs.existsSync(manifestPath)) {
        const prevData = readManifest(manifestPath);
        const configDiffMessages = [];
        if (prevData.prefix !== prefix) {
            configDiffMessages.push(`Different "prefix": "${prevData.prefix}" -> "${prefix}"`);
        }
        if (prevData.cacheDir !== cacheDir) {
            configDiffMessages.push(`Different "cacheDir": "${prevData.cacheDir}" -> "${cacheDir}"`);
        }
        if (prevData.distDir !== distDir) {
            configDiffMessages.push(`Different "distDir": "${prevData.distDir}" -> "${distDir}"`);
        }
        if (
            prevData.reservedNames?.length !== reservedNames?.length ||
            prevData.reservedNames?.some((name) => !reservedNames?.includes(name))
        ) {
            configDiffMessages.push(
                `Different "reservedNames": "${prevData.reservedNames?.join(", ")}" -> "${reservedNames?.join(", ")}"`,
            );
        }
        if (prevData.version !== CODE_VERSION) {
            configDiffMessages.push(`Different package version: "${prevData.version}" -> "${CODE_VERSION}"`);
        }
        if (prevData.disableDistDeletion && !disableDistDeletion) {
            configDiffMessages.push(`"disableDistDeletion" set to "${disableDistDeletion}"`);
        }
        if (configDiffMessages.length) {
            configurationError = `Changes found in package configuration: \n${configDiffMessages.map((message) => `- ${message};\n`)}`;
        }
    } else {
        configurationError = `Can not find the package cache manifest at ${manifestPath}\n`;
    }
    if (configurationError) {
        if (!disableDistDeletion) {
            console.log(`classnames-minifier: ${configurationError}Cleaning the dist folder...`);
            fs.rmSync(distDir, { recursive: true, force: true });
            console.log("classnames-minifier: Dist folder cleared");
        } else {
            console.log(`classnames-minifier: ${configurationError}"disableDistDeletion" option was set to true`);
        }
    }
    if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify({ ...pluginOptions, version: CODE_VERSION }), { encoding: "utf-8" });
};

export default validateDist;
