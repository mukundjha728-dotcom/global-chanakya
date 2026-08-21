require("dotenv").config({path:".env.local"});
// We will use ts-node to run the actual TS code
const { execSync } = require("child_process");
execSync("npx ts-node -O \"{\\\"module\\\":\\\"commonjs\\\"}\" scripts/test_mongoose_blog.ts", {stdio: "inherit"});
