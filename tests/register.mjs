// Node >= 22.15 (ou 24). Transpila TS/TSX e CSS apenas no processo de teste.
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

process.env.VITE_API_URL = 'http://api.test';
process.env.VITE_USE_MOCK = 'false';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL) {
      const url = new URL(specifier, context.parentURL);
      if (!existsSync(fileURLToPath(url))) {
        for (const extension of ['.ts', '.tsx']) {
          const candidate = new URL(url);
          candidate.pathname += extension;
          if (existsSync(fileURLToPath(candidate))) return { url: candidate.href, shortCircuit: true };
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    const pathname = new URL(url).pathname;
    if (pathname.endsWith('.css')) return {
      format: 'module', shortCircuit: true,
      source: 'export default new Proxy({}, { get: (_, name) => String(name) });',
    };
    if (/\.tsx?$/.test(pathname)) {
      const source = readFileSync(new URL(url), 'utf8').replaceAll('import.meta.env', 'process.env');
      return { format: 'module', shortCircuit: true, source: ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
        fileName: pathname,
      }).outputText };
    }
    return nextLoad(url, context);
  },
});
