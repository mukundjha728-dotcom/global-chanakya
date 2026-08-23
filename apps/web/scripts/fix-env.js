const fs = require('fs');
let env = fs.readFileSync('.env.local', 'utf8');
env = env.replace(/GROQ_API_KEY=\"(gsk_.*?)\"/, 'GROQ_API_KEY=$1');
fs.writeFileSync('.env.local', env);
console.log('Fixed quotes in .env.local');
