// cronScheduler.js
const HumanTrafficGenerator = require("../src/trafficGenerator");
const { CronJob } = require("cron");

class TrafficCronScheduler {
  constructor() {
    this.trafficGenerator = new HumanTrafficGenerator();
    this.jobs = new Map();
  }

  setupCronJob(url, cronExpression = "0 */20 * * *") {
    const jobId = `${url}_${Date.now()}`;

    const job = new CronJob(cronExpression, async () => {
      try {
        this.trafficGenerator.logger.info(
          `Executing scheduled visit to: ${url}`
        );
        await this.trafficGenerator.visitUrl(url);

        // Save report every 10 visits
        if (this.trafficGenerator.impressions.length % 10 === 0) {
          await this.trafficGenerator.saveReport();
        }
      } catch (error) {
        this.trafficGenerator.logger.error(
          `Error in cron job for ${url}: ${error.message}`
        );
      }
    });

    this.jobs.set(jobId, job);
    job.start();

    this.trafficGenerator.logger.info(
      `Cron job started for ${url} with schedule: ${cronExpression}`
    );
    return jobId;
  }

  stopJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      this.trafficGenerator.logger.info(`Stopped job: ${jobId}`);
      return true;
    }
    return false;
  }

  stopAllJobs() {
    this.jobs.forEach((job, jobId) => {
      job.stop();
      this.trafficGenerator.logger.info(`Stopped job: ${jobId}`);
    });
    this.jobs.clear();
  }

  listJobs() {
    return Array.from(this.jobs.keys());
  }

  async generateReport() {
    return await this.trafficGenerator.saveReport();
  }

  async saveAllData() {
    const reportFile = await this.trafficGenerator.saveReport();
    const impressionsFile = await this.trafficGenerator.saveImpressions();
    return { reportFile, impressionsFile };
  }
}

module.exports = TrafficCronScheduler;
