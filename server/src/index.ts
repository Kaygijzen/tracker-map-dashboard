import { createApp } from './app.js';
import { ConfigError, loadConfig } from './config.js';
import { type KeyEntry, KeysFileError, loadKeysFile } from './keys.js';
import { createLocationProvider } from './location/factory.js';
import { toTracker } from './trackers.js';

let config;
let entries: KeyEntry[];
try {
  config = loadConfig();
  entries = loadKeysFile(config.keysFile);
} catch (error) {
  if (error instanceof ConfigError || error instanceof KeysFileError) console.error(error.message);
  else console.error('Failed to load configuration or keys file');
  process.exit(1);
}

// Full entries (with secrets) go only to the location provider; routes get the public shape.
const locationProvider = createLocationProvider(config, entries);
const trackers = entries.map(toTracker);

createApp({ trackers, locationProvider, clientDir: config.clientDir }).listen(config.port, (error) => {
  if (error) {
    console.error(`Could not listen on port ${config.port}: ${(error as NodeJS.ErrnoException).code ?? error.message}`);
    process.exit(1);
  }
  const what = config.clientDir ? 'Dashboard' : 'API';
  console.log(
    `${what} listening on http://localhost:${config.port} (${trackers.length} trackers, ${config.locationProvider} locations)`,
  );
});
