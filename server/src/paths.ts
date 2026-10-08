import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repository root, resolved from this module so it works from `src/` (tsx) and `dist/` (node). */
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
