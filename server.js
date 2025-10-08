// server.js
const express = require("express");
const TrafficCronScheduler = require("./src/cronScheduler");

const app = express();
const scheduler = new TrafficCronScheduler();

app.use(express.json());

// Add a URL to monitor
app.post("/monitor", async (req, res) => {
  try {
    const { url, schedule = "0 */2 * * *" } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const jobId = scheduler.setupCronJob(url, schedule);

    res.json({
      message: "URL added to monitoring",
      jobId,
      url,
      schedule,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get traffic report
app.get("/report", async (req, res) => {
  try {
    const report = scheduler.trafficGenerator.generateTrafficReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs
app.get("/jobs", (req, res) => {
  res.json({
    jobs: scheduler.listJobs(),
    total: scheduler.listJobs().length,
  });
});

// Stop a job
app.delete("/job/:jobId", (req, res) => {
  const { jobId } = req.params;
  const success = scheduler.stopJob(jobId);

  if (success) {
    res.json({ message: "Job stopped successfully" });
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

const PORT = process.env.PORT || 4400;
app.listen(PORT, () => {
  console.log(`Traffic Generator API running on port ${PORT}`);
});
