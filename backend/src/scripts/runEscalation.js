require("dotenv").config();

const connectDB = require("../config/db");
const processEscalations = require("../utils/processEscalations");

async function runEscalationJob() {
  await connectDB();
  const count = await processEscalations();
  console.log(`${count} complaint(s) escalated.`);
  process.exit(0);
}

runEscalationJob().catch((error) => {
  console.error("Escalation job failed:", error.message);
  process.exit(1);
});
