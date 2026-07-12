import { TopicService } from "./src/modules/seo/services/topic.service";
import mongoose from "mongoose";

async function run() {
  try {
    const data = await TopicService.getTopicHubData("strategic-intelligence");
    console.log("Success! Data keys:", Object.keys(data));
    console.log("Counts:", data.countries.length, data.leaders.length, data.conflicts.length, data.reports.length);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.disconnect();
  }
}
run();
