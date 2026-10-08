import { readFileSync } from 'node:fs';
import { z } from 'zod';

/**
 * Shape of one entry in keys.json. Contains secrets (privateKey, additionalKeys, account):
 * this type must never be sent to a client. Use `toTracker()` to build the public shape.
 */
const keyEntrySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  colorComponents: z.array(z.number()).length(4),
  isDeployed: z.boolean(),
  isActive: z.boolean(),
  usesDerivation: z.boolean().optional(),
  privateKey: z.string(),
  additionalKeys: z.array(z.unknown()).optional(),
  account: z.unknown().optional(),
});

const keysFileSchema = z.array(keyEntrySchema);

export type KeyEntry = z.infer<typeof keyEntrySchema>;

export class KeysFileError extends Error {
  override name = 'KeysFileError';
}

function formatPath(issuePath: PropertyKey[]): string {
  const [index, ...rest] = issuePath;
  if (typeof index !== 'number') return '(root)';
  return rest.length ? `entry[${index}].${rest.map(String).join('.')}` : `entry[${index}]`;
}

/** Parses keys.json content. Error messages name entries and fields but never include values. */
export function parseKeysFile(content: string, source = 'keys file'): KeyEntry[] {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    throw new KeysFileError(`${source} is not valid JSON`);
  }

  const result = keysFileSchema.safeParse(json);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `  ${formatPath(issue.path)}: ${issue.message}`);
    throw new KeysFileError(`${source} is invalid:\n${details.join('\n')}`);
  }

  const seen = new Set<number>();
  for (const entry of result.data) {
    if (seen.has(entry.id)) throw new KeysFileError(`${source} has duplicate id ${entry.id}`);
    seen.add(entry.id);
  }
  return result.data;
}

/** Reads and validates the keys file. A missing file yields an empty list with a warning. */
export function loadKeysFile(filePath: string, warn: (message: string) => void = console.warn): KeyEntry[] {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      warn(`Keys file not found at ${filePath}; serving no trackers.`);
      return [];
    }
    throw new KeysFileError(`Could not read keys file at ${filePath}`);
  }
  return parseKeysFile(content, filePath);
}
