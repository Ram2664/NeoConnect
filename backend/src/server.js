require("dotenv").config();

const cron = require("node-cron");
const connectDB = require("./config/db");
const app = require("./app");
const processEscalations = require("./utils/processEscalations");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, function startMessage() {
    console.log(`Server running on port ${PORT}`);
  });

  cron.schedule("0 9 * * *", async function scheduledEscalation() {
    try {
      const count = await processEscalations();
      console.log(`Daily escalation job finished. ${count} case(s) updated.`);
    } catch (error) {
      console.error("Daily escalation job failed:", error.message);
    }
  });
}

startServer();
