/* eslint-env node */
/**
 * Builds a signed release APK or AAB and copies it to dist/.
 *   node scripts/build-android.js apk
 *   node scripts/build-android.js aab
 * Signs with android/keystore.properties (see scripts/make-keystore.js).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const kind = process.argv[2];
const targets = {
  apk: {
    task: 'assembleRelease',
    output: path.join('app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
  },
  aab: {
    task: 'bundleRelease',
    output: path.join('app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab'),
  },
};
const target = targets[kind];
if (!target) {
  console.error('Usage: node scripts/build-android.js <apk|aab>');
  process.exit(1);
}

const root = path.join(__dirname, '..');
const androidDir = path.join(root, 'android');

if (!fs.existsSync(path.join(androidDir, 'keystore.properties'))) {
  console.error(
    'android/keystore.properties not found. Run `npm run keystore` first.',
  );
  process.exit(1);
}

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const result = spawnSync(gradlew, [target.task], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const { version } = require(path.join(root, 'package.json'));
const distDir = path.join(root, 'dist');
fs.mkdirSync(distDir, { recursive: true });
const dest = path.join(distDir, `ShadowMan-${version}.${kind}`);
fs.copyFileSync(path.join(androidDir, target.output), dest);
console.log(`\nBuilt ${dest}`);
