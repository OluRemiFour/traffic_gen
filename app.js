// app.js
const TrafficCronScheduler = require("./src/cronScheduler.js");

// Example usage
async function main() {
  const scheduler = new TrafficCronScheduler();

  // Add your target URLs here
  const targetUrls = [
    // "https://example.com",
    "https://url-tracker-icjf.onrender.com/weKh3z",
  ];

  // Setup cron jobs for each URL (every 2 hours)
  targetUrls.forEach((url) => {
    scheduler.setupCronJob(url, "0 */2 * * *"); // Every 2 hours
  });

  // Also run once immediately
  for (const url of targetUrls) {
    try {
      await scheduler.trafficGenerator.visitUrl(url);
    } catch (error) {
      console.error(`Initial visit failed for ${url}:`, error.message);
    }
  }

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down traffic generator...");

    const report = scheduler.trafficGenerator.generateTrafficReport();
    console.log("\n=== Final Traffic Report ===");
    console.log(`Total impressions: ${report.totalImpressions}`);
    console.log(`Success rate: ${report.successRate.toFixed(1)}%`);
    console.log(`Average read time: ${report.averageReadTime.toFixed(1)}s`);

    await scheduler.saveAllData();
    scheduler.stopAllJobs();

    console.log("Traffic generator stopped gracefully.");
    process.exit(0);
  });

  // Optional: Auto-save every hour
  setInterval(async () => {
    await scheduler.trafficGenerator.saveImpressions();
  }, 60 * 60 * 1000);

  console.log("Traffic generator started! Press Ctrl+C to stop.");
  console.log("Scheduled jobs:");
  console.log(scheduler.listJobs());
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: node app.js [url1] [url2] ...

Examples:
  node app.js https://example.com
  node app.js https://site1.com https://site2.com

If no URLs provided, will use default example URLs.
        `);
    process.exit(0);
  }

  main().catch(console.error);
}

module.exports = { TrafficCronScheduler };
