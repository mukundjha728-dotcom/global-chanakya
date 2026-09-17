const http = require('http');

const ENDPOINTS = [
  { name: "Root", path: "/" },
  { name: "Robots", path: "/robots.txt" },
  { name: "Sitemap", path: "/sitemap.xml" },
  { name: "Blog", path: "/blogs/serbia-kosovo-tensions-explained-2026" },
  { name: "PlatformSEO", path: "/platformseo/diplomacy" }
];

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    http.get({ hostname: 'localhost', port: 3000, path: endpoint.path }, (res) => {
      resolve({ name: endpoint.name, path: endpoint.path, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ name: endpoint.name, path: endpoint.path, status: 'ERROR', error: err.message });
    });
  });
}

async function verify() {
  console.log("Verifying endpoints...");
  let allPass = true;
  for (const endpoint of ENDPOINTS) {
    const res = await checkEndpoint(endpoint);
    console.log(`${res.name} (${res.path}): ${res.status}`);
    if (res.status !== 200) {
      allPass = false;
    }
  }
  if (allPass) {
    console.log("SUCCESS: All endpoints returned 200.");
  } else {
    console.log("FAILURE: Some endpoints failed.");
  }
}

verify();
