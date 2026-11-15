import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const app = fileURLToPath(new URL('../app/', import.meta.url));
let count = 0;
for (const name of readdirSync(app).filter(name => name.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', path.join(app, name)], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `Cannot check ${name}`);
  count++;
}
const html = readFileSync(path.join(app, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const reference = match[1];
  if (/^(?:[a-z]+:|#|\/\/)/i.test(reference)) continue;
  if (!existsSync(path.join(app, reference.split(/[?#]/)[0]))) throw new Error(`Missing entry-page asset: ${reference}`);
}
console.log(`Passed: ${count} JavaScript syntax checks and entry-page asset references.`);
