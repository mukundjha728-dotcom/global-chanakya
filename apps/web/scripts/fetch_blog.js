const http = require("http");
http.get("http://localhost:3000/blogs/india-growth-defence-geopolitics-before-after-2014", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    const fs = require("fs");
    fs.writeFileSync("temp_error_page.html", data);
    console.log("Status:", res.statusCode);
    
    if (data.includes("MissingSchemaError")) {
       const match = data.match(/MissingSchemaError[^<"']*/);
       console.log("Found error:", match ? match[0] : "MissingSchemaError");
    } else {
       console.log("MissingSchemaError not found in HTML");
       // Try generic error match
       const match2 = data.match(/Error: [^<"']*/);
       if (match2) console.log("Found generic error:", match2[0]);
    }
  });
}).on("error", (e) => console.error(e));
