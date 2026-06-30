import fs from 'fs';
import path from 'path';

const REQUIRED_ENVS = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN"
];

function checkEnv() {
  let envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), 'apps/web/.env');
  }
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const missing = [];

  for (const env of REQUIRED_ENVS) {
    if (!process.env[env] && !envContent.includes(`${env}=`)) {
      missing.push(env);
    }
  }

  if (missing.length > 0) {
    console.error("❌ CRITICAL: Missing required environment variables:");
    missing.forEach(e => console.error(`  - ${e}`));
    console.error("Failing deployment audit.");
    process.exit(1);
  }

  console.log("✅ All required environment variables are present.");
  process.exit(0);
}

checkEnv();
