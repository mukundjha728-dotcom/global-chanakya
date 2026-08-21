const fs = require("fs");
const pageCode = fs.readFileSync("src/app/blogs/[slug]/page.tsx", "utf8");
console.log("Imports in page.tsx:");
pageCode.split("\n").filter(line => line.includes("import")).forEach(l => console.log(l));
