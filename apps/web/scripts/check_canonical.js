const fs = require("fs");
const pageCode = fs.readFileSync("src/app/blogs/[slug]/page.tsx", "utf8");
console.log("Canonical generating in page.tsx:", pageCode.includes("canonical"));
