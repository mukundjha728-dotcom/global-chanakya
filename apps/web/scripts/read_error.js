const fs = require("fs");
const data = fs.readFileSync("temp_error_page.html", "utf8");
const idx = data.indexOf("MissingSchemaError");
if (idx !== -1) {
    console.log(data.substring(idx, idx + 200));
}
