const tsConfigPaths = require("tsconfig-paths");

const baseUrl = "./build"; // Either absolute or relative path. If relative it's resolved to current working directory.
tsConfigPaths.register({
  baseUrl,
  paths: {}
});

import { JSDOM } from 'jsdom';

const dom = new JSDOM();

globalThis.window = dom.window as any;
globalThis.document = dom.window.document as any;