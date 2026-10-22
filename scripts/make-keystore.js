/* eslint-env node */
/**
 * Creates the Android upload/release keystore and android/keystore.properties.
 *   node scripts/make-keystore.js
 * Optional environment overrides:
 *   KEYSTORE_PASSWORD  (default: random 24 chars)
 *   KEY_ALIAS          (default: shadowman)
 *   KEY_DNAME          (default: "CN=ShadowMan, O=ShadowMan, C=IN")
 * Both files are gitignored. Back them up: Google Play only accepts updates
 * signed with the same upload key.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const androidDir = path.join(__dirname, '..', 'android');
const storeName = 'shadowman-release.keystore';
const storePath = path.join(androidDir, 'app', storeName);
const propsPath = path.join(androidDir, 'keystore.properties');

if (fs.existsSync(storePath) || fs.existsSync(propsPath)) {
  console.error(
    `Refusing to overwrite an existing keystore.\n  ${storePath}\n  ${propsPath}\n` +
      'Delete them yourself only if you are sure the key was never used on Google Play.',
  );
  process.exit(1);
}

const keytool = process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME, 'bin', 'keytool')
  : 'keytool';
const password =
  process.env.KEYSTORE_PASSWORD ||
  crypto.randomBytes(18).toString('base64').replace(/[+/=]/g, 'x');
const alias = process.env.KEY_ALIAS || 'shadowman';
const dname = process.env.KEY_DNAME || 'CN=ShadowMan, O=ShadowMan, C=IN';

const result = spawnSync(
  keytool,
  [
    '-genkeypair',
    '-v',
    '-storetype', 'PKCS12',
    '-keystore', storePath,
    '-alias', alias,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-storepass', password,
    // PKCS12 keystores use the store password for the key as well.
    '-keypass', password,
    '-dname', dname,
  ],
  { stdio: 'inherit' },
);
if (result.error || result.status !== 0) {
  console.error('keytool failed. Is a JDK installed and JAVA_HOME set?');
  process.exit(1);
}

fs.writeFileSync(
  propsPath,
  [
    '# Release signing. Gitignored: keep a backup of this file and the keystore.',
    `storeFile=${storeName}`,
    `storePassword=${password}`,
    `keyAlias=${alias}`,
    `keyPassword=${password}`,
    '',
  ].join('\n'),
);

console.log(`\nKeystore:   ${storePath}`);
console.log(`Properties: ${propsPath}`);
console.log('Back up both files somewhere safe (password manager, private drive).');
