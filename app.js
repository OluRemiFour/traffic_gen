// app.js
// const TrafficCronScheduler = require("./src/cronScheduler.js");

// // Example usage
// async function main() {
//   const scheduler = new TrafficCronScheduler();

//   // Add your target URLs here
//   const targetUrls = [
//     // "https://example.com",
//     // "https://url-tracker-icjf.onrender.com/weKh3z",
//     "https://your_url_tracker/EUlM9T",
//   ];

//   // Setup cron jobs for each URL (every 2 hours)
//   targetUrls.forEach((url) => {
//     // scheduler.setupCronJob(url, "0 */2 * * *"); // Every 2 hours
//     scheduler.setupCronJob(url, "0 */20 * * *"); // Every 20 min
//   });

//   // Also run once immediately
//   for (const url of targetUrls) {
//     try {
//       await scheduler.trafficGenerator.visitUrl(url);
//     } catch (error) {
//       console.error(`Initial visit failed for ${url}:`, error.message);
//     }
//   }

//   // Handle graceful shutdown
//   process.on("SIGINT", async () => {
//     console.log("\nShutting down traffic generator...");

//     const report = scheduler.trafficGenerator.generateTrafficReport();
//     console.log("\n=== Final Traffic Report ===");
//     console.log(`Total impressions: ${report.totalImpressions}`);
//     console.log(`Success rate: ${report.successRate.toFixed(1)}%`);
//     console.log(`Average read time: ${report.averageReadTime.toFixed(1)}s`);

//     await scheduler.saveAllData();
//     scheduler.stopAllJobs();

//     console.log("Traffic generator stopped gracefully.");
//     process.exit(0);
//   });

//   // Optional: Auto-save every hour
//   setInterval(async () => {
//     await scheduler.trafficGenerator.saveImpressions();
//   }, 60 * 60 * 1000);

//   console.log("Traffic generator started! Press Ctrl+C to stop.");
//   console.log("Scheduled jobs:");
//   console.log(scheduler.listJobs());
// }

// // CLI interface
// if (require.main === module) {
//   const args = process.argv.slice(2);

//   if (args.includes("--help") || args.includes("-h")) {
//     console.log(`
// Usage: node app.js [url1] [url2] ...

// Examples:
//   node app.js https://example.com
//   node app.js https://site1.com https://site2.com

// If no URLs provided, will use default example URLs.
//         `);
//     process.exit(0);
//   }

//   main().catch(console.error);
// }

// module.exports = { TrafficCronScheduler };


// ----------------------------------- OLD

// app.js
const TrafficCronScheduler = require('./src/cronScheduler');

// Example usage with proper URL encoding
async function main() {
    const scheduler = new TrafficCronScheduler();
    
    // Use properly encoded URLs
    const targetUrls = [
        'https://www.fiverr.com/lilldesire/clone-shopify-store-shopify-landing-page-clone-shopify',
        // Add more URLs here if needed
    ];

    // Test URL encoding first
    console.log('Testing URL encoding...');
    targetUrls.forEach(url => {
        try {
            const encodedUrl = encodeURI(url);
            console.log(`Original: ${url}`);
            console.log(`Encoded: ${encodedUrl}`);
            console.log('---');
        } catch (error) {
            console.error(`Invalid URL: ${url} - ${error.message}`);
        }
    });

    // Setup cron jobs for each URL (every 20 minutes for testing)
    targetUrls.forEach(url => {
        try {
            scheduler.setupCronJob(url, '*/20 * * * *'); // Every 20 minutes for testing
        } catch (error) {
            console.error(`Failed to setup cron job for ${url}: ${error.message}`);
        }
    });

    // Also run once immediately
    console.log('Running initial visits...');
    for (const url of targetUrls) {
        try {
            console.log(`Visiting: ${url}`);
            await scheduler.trafficGenerator.visitUrl(url);
        } catch (error) {
            console.error(`Initial visit failed for ${url}:`, error.message);
        }
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nShutting down traffic generator...');
        
        const report = scheduler.trafficGenerator.generateTrafficReport();
        console.log('\n=== Final Traffic Report ===');
        console.log(`Total impressions: ${report.totalImpressions}`);
        console.log(`Success rate: ${report.successRate?.toFixed(1) || 0}%`);
        console.log(`Average read time: ${report.averageReadTime?.toFixed(1) || 0}s`);
        
        await scheduler.saveAllData();
        scheduler.stopAllJobs();
        
        console.log('Traffic generator stopped gracefully.');
        process.exit(0);
    });

    // Auto-save every hour
    setInterval(async () => {
        try {
            await scheduler.trafficGenerator.saveImpressions();
        } catch (error) {
            console.error('Auto-save failed:', error.message);
        }
    }, 60 * 60 * 1000);

    console.log('\nTraffic generator started! Press Ctrl+C to stop.');
    console.log('Scheduled jobs:');
    console.log(scheduler.listJobs());
    console.log('\nYou can also run the web interface with: node server.js');
}

// Test with a simple URL first
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        // Test with a simple URL first
        const testUrl = 'https://httpbin.org/json';
        console.log(`Testing with simple URL: ${testUrl}`);
        const scheduler = new TrafficCronScheduler();
        scheduler.trafficGenerator.visitUrl(testUrl)
            .then(() => {
                console.log('Test completed successfully!');
                process.exit(0);
            })
            .catch(error => {
                console.error('Test failed:', error.message);
                process.exit(1);
            });
    } else {
        main().catch(error => {
            console.error('Application failed to start:', error.message);
            process.exit(1);
        });
    }
}

module.exports = { TrafficCronScheduler };