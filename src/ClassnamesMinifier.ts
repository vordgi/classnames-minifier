import path from 'path';
import type { Config } from './lib/types/plugin';
import validateConfig from './lib/validateConfig';
import ConverterMinified from './lib/ConverterMinified';
import validateDist from './lib/validateDist';

class ClassnamesMinifier {
  converterMinified: ConverterMinified;

  constructor(config: Config) {
    validateConfig(config);

    if (config.cacheDir) {
      validateDist(config);
    }

    this.converterMinified = new ConverterMinified(config);
  }

  get getLocalIdent() {
    return this.converterMinified.getLocalIdent.bind(this.converterMinified);
  }

  get preLoader() {
    return {
      loader: path.join(__dirname, './lib/classnames-minifier-preloader.js'),
      options: {
        classnamesMinifier: this.converterMinified,
      },
    }
  }

  get postLoader() {
    return {
      loader: path.join(__dirname, './lib/classnames-minifier-postloader.js'),
      options: {
        classnamesMinifier: this.converterMinified,
      },
    }
  }
};

export default ClassnamesMinifier;
