const fs = require("fs");
const data = fs.readFileSync("temp_error_page.html", "utf8");
const match = data.match(/MissingSchemaError: Schema hasn&#39;t been registered for model &quot;([^&]+)&quot;/);
if (match) {
   console.log("Missing Model:", match[1]);
} else {
   const match2 = data.match(/MissingSchemaError[^<"']*/);
   console.log("Raw match:", match2 ? match2[0] : "Not found");
}
