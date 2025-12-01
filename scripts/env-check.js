/**
 * Simple pre-deploy environment sanity check.
 * Run before deploy to ensure required secrets are set.
 */
const fs = require('fs');
const path = require('path');

function readEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  const vars = {};
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      vars[key] = val;
    }
  }
  return vars;
}

const env = Object.assign({}, process.env, readEnvFile());

let ok = true;

function fail(msg) {
  console.error('❌', msg);
  ok = false;
}

console.log('🔎 Running pre-deploy env check...');

if (!env.JWT_SECRET || env.JWT_SECRET === 'kzstore-secret-key-change-in-production') {
  fail('JWT_SECRET is not set or uses the default insecure value');
}

if (!env.FRONTEND_URL) {
  console.warn('⚠️ FRONTEND_URL is not set. Recommended to set FRONTEND_URL to production value.');
}

if (env.NODE_ENV !== 'production') {
  console.warn('⚠️ NODE_ENV is not production. Make sure to set NODE_ENV=production for prod deploy');
}

// Check cookie secure configuration suggestion
console.log('💡 Suggested: Ensure cookies are set with secure: true in production and served via HTTPS');

if (!ok) {
  console.error('❌ Environment check failed. Please fix the issues above before deploying.');
  process.exit(1);
}

console.log('✅ Environment looks good for deploy.');
