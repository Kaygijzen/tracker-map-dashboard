import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { KeysFileError, loadKeysFile } from './keys.js';
import { MockLocationProvider } from './location/mock.js';
import { toTracker } from './trackers.js';

const config = loadConfig();

let trackers;
try {
  trackers = loadKeysFile(config.keysFile).map(toTracker);
} catch (error) {
  console.error(error instanceof KeysFileError ? error.message : 'Failed to load keys file');
  process.exit(1);
}

const locationProvider = new MockLocationProvider({ center: config.mockCenter });

createApp({ trackers, locationProvider }).listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port} (${trackers.length} trackers)`);
});
