// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LoaderContext } from "webpack";
import fs from "fs";
import path from "path";
import type { Config } from "./lib/types/plugin";
import { CODE_VERSION } from "./lib/constants/configuration";
import validateConfig from "./lib/validateConfig";
import ConverterMinified from "./lib/ConverterMinified";
import validateDist from "./lib/validateDist";
import rmDist from "./lib/rmDist";

class ClassnamesMinifier {
    converterMinified: ConverterMinified;

    constructor(config: Config) {
        validateConfig(config);

        this.converterMinified = new ConverterMinified(config);

        if (!config.cacheDir || !config.distDir) {
            console.log(
                "classnames-minifier: Failed to check the dist folder because cacheDir or distDir is not specified",
            );
        } else {
            const manifestDir = path.join(config.cacheDir, "ncm-meta");
            const manifestPath = path.join(manifestDir, "manifest.json");

            let distCleared = false;
            if (config.cacheDir) {
                const errors = validateDist(config, manifestPath);

                if (errors) {
                    if (!config.disableDistDeletion) {
                        rmDist(config.distDir, errors);
                        distCleared = true;
                    } else {
                        console.log(`classnames-minifier: ${errors}"disableDistDeletion" option was set to true`);
                    }
                }
            }

            const { freedNamesPolicy = "transmit", blockLimit = 100000 } = config.experimental || {};
            if (
                freedNamesPolicy === "block" &&
                this.converterMinified.freeClasses.length > blockLimit &&
                config.distDir
            ) {
                distCleared = true;
                rmDist(config.distDir, `Freed names exceeds the limit (${blockLimit})`);
            }
            if (distCleared) {
                this.converterMinified.reset();
            }
            if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
            fs.writeFileSync(manifestPath, JSON.stringify({ ...config, version: CODE_VERSION }), { encoding: "utf-8" });
        }
    }

    get getLocalIdent() {
        return this.converterMinified.getLocalIdent.bind(this.converterMinified);
    }

    get preLoader() {
        return {
            loader: path.join(__dirname, "./lib/classnames-minifier-preloader.js"),
            options: {
                classnamesMinifier: this.converterMinified,
            },
        };
    }

    get postLoader() {
        return {
            loader: path.join(__dirname, "./lib/classnames-minifier-postloader.js"),
            options: {
                classnamesMinifier: this.converterMinified,
            },
        };
    }
}

export default ClassnamesMinifier;
