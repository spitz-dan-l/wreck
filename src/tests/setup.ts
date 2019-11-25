import { JSDOM } from 'jsdom';

const dom = new JSDOM();

globalThis.window = dom.window as any;
globalThis.document = dom.window.document as any;