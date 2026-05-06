import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envContent = fs.readFileSync(path.resolve(__dirname, ".env"), "utf-8");
let uri = "";
envContent.split("\n").forEach(line => {
  if (line.startsWith("MONGODB_URI=")) {
    uri = line.substring(line.indexOf("=") + 1).trim().replace(/^"|"$/g, '');
  }
});

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    
    const db = client.db(); // uses default db from URI
    const users = db.collection("users");
    
    // Find all users
    const allUsers = await users.find({}).toArray();
    console.log("Found users:", allUsers.map(u => ({ email: u.email, role: u.role })));
    
    if (allUsers.length > 0) {
      // Make the first user an admin
      const email = allUsers[0].email;
      await users.updateOne({ email }, { $set: { role: "admin" } });
      console.log(`Successfully made ${email} an admin!`);
    } else {
      console.log("No users found in the database. Please sign up on the website first.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
