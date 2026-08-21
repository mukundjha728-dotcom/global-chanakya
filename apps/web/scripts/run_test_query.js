require("dotenv").config({path:".env.local"});
const { execSync } = require("child_process");
execSync("npx ts-node -O \"{\\\"module\\\":\\\"commonjs\\\"}\" scripts/test_query.ts", {stdio: "inherit"});
