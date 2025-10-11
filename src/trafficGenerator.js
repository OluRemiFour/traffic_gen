// src/trafficGenerator.js
// const axios = require("axios");
// const UserAgent = require("user-agents");
// const { JSDOM } = require("jsdom");
// const fs = require("fs").promises;

// class HumanTrafficGenerator {
//   constructor() {
//     this.impressions = [];
//     this.setupLogging();
//   }

//   setupLogging() {
//     this.logger = {
//       info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
//       error: (msg) =>
//         console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
//       warn: (msg) =>
//         console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
//     };
//   }

//   async humanDelay(minSeconds = 2, maxSeconds = 8) {
//     const delay = Math.random() * (maxSeconds - minSeconds) + minSeconds;
//     await new Promise((resolve) => setTimeout(resolve, delay * 1000));
//     return delay;
//   }

//   randomMouseMovements() {
//     const movements = [];
//     const movementCount = Math.floor(Math.random() * 6) + 3; // 3-8 movements

//     for (let i = 0; i < movementCount; i++) {
//       movements.push({
//         x: Math.floor(Math.random() * 1920),
//         y: Math.floor(Math.random() * 1080),
//         timestamp: Date.now() + Math.random() * 2000,
//       });
//     }
//     return movements;
//   }

//   getRandomHeaders() {
//     const userAgent = new UserAgent();
//     return {
//       "User-Agent": userAgent.toString(),
//       Accept:
//         "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//       "Accept-Language": "en-US,en;q=0.9",
//       "Accept-Encoding": "gzip, deflate, br",
//       Connection: "keep-alive",
//       "Upgrade-Insecure-Requests": "1",
//       "Sec-Fetch-Dest": "document",
//       "Sec-Fetch-Mode": "navigate",
//       "Sec-Fetch-Site": "none",
//       "Cache-Control": "max-age=0",
//     };
//   }

//   getRandomUserAgent() {
//     const userAgent = new UserAgent();
//     return userAgent.toString();
//   }

//   isInternalLink(baseUrl, link) {
//     try {
//       const baseDomain = new URL(baseUrl).hostname;
//       const linkDomain = new URL(link, baseUrl).hostname;
//       return baseDomain === linkDomain;
//     } catch (error) {
//       return false;
//     }
//   }

//   async simulatePageInteraction(url, axiosInstance) {
//     try {
//       // Initial page visit with random headers
//       const headers = this.getRandomHeaders();
//       const response = await axiosInstance.get(url, {
//         headers,
//         timeout: 15000,
//         validateStatus: () => true, // Don't throw on HTTP errors
//       });

//       if (response.status !== 200) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       // Simulate reading time
//       const readTime = await this.humanDelay(3, 15);

//       // Parse page and potentially click internal links
//       const dom = new JSDOM(response.data);
//       const links = dom.window.document.querySelectorAll("a[href]");
//       const internalLinks = [];

//       links.forEach((link) => {
//         try {
//           const href = link.href;
//           if (this.isInternalLink(url, href)) {
//             internalLinks.push(href);
//           }
//         } catch (error) {
//           // Skip invalid URLs
//         }
//       });

//       // 30% chance to click an internal link
//       if (Math.random() < 0.3 && internalLinks.length > 0) {
//         const randomLink =
//           internalLinks[Math.floor(Math.random() * internalLinks.length)];

//         // Delay before clicking
//         await this.humanDelay(1, 3);

//         // Visit the internal link
//         await axiosInstance.get(randomLink, {
//           headers,
//           timeout: 10000,
//         });

//         // Read the new page
//         await this.humanDelay(2, 7);
//       }

//       return {
//         success: true,
//         contentLength: response.data.length,
//         readTime,
//         statusCode: response.status,
//       };
//     } catch (error) {
//       this.logger.error(`Error visiting ${url}: ${error.message}`);
//       return {
//         success: false,
//         contentLength: 0,
//         readTime: 0,
//         statusCode: 0,
//         error: error.message,
//       };
//     }
//   }

//   generateImpressionData(url, visitResult) {
//     const screenResolutions = [
//       "1920x1080",
//       "1366x768",
//       "1536x864",
//       "1440x900",
//       "1280x720",
//       "1600x900",
//       "1024x768",
//     ];

//     const languages = ["en-US", "en-GB", "en-CA", "en-AU"];
//     const timezones = [
//       "America/New_York",
//       "America/Los_Angeles",
//       "America/Chicago",
//       "Europe/London",
//       "Europe/Paris",
//     ];

//     const impression = {
//       timestamp: new Date().toISOString(),
//       url: url,
//       success: visitResult.success,
//       userAgent: this.getRandomUserAgent(),
//       ipAddress: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
//       pageLoadTime: Math.random() * (4.2 - 1.5) + 1.5,
//       readTimeSeconds: visitResult.readTime,
//       contentLength: visitResult.contentLength,
//       mouseMovements: this.randomMouseMovements(),
//       scrollDepth: Math.random() * 0.65 + 0.3, // 30-95%
//       screenResolution:
//         screenResolutions[Math.floor(Math.random() * screenResolutions.length)],
//       language: languages[Math.floor(Math.random() * languages.length)],
//       timezone: timezones[Math.floor(Math.random() * timezones.length)],
//       statusCode: visitResult.statusCode,
//     };

//     this.impressions.push(impression);
//     return impression;
//   }

//   async visitUrl(url) {
//     this.logger.info(`Starting visit to: ${url}`);

//     // Create new axios instance for this session
//     const axiosInstance = axios.create();

//     // Add random delays to mimic human behavior
//     await this.humanDelay(1, 3);

//     const visitResult = await this.simulatePageInteraction(url, axiosInstance);
//     const impression = this.generateImpressionData(url, visitResult);

//     if (visitResult.success) {
//       this.logger.info(
//         `Successfully visited ${url} - Read time: ${visitResult.readTime.toFixed(
//           2
//         )}s`
//       );
//     } else {
//       this.logger.warn(`Failed to visit ${url}: ${visitResult.error}`);
//     }

//     return impression;
//   }

//   generateTrafficReport() {
//     if (this.impressions.length === 0) {
//       return { message: "No impressions recorded yet." };
//     }

//     const successfulVisits = this.impressions.filter((imp) => imp.success);
//     const failedVisits = this.impressions.filter((imp) => !imp.success);

//     const report = {
//       generatedAt: new Date().toISOString(),
//       totalImpressions: this.impressions.length,
//       successfulVisits: successfulVisits.length,
//       failedVisits: failedVisits.length,
//       successRate: (successfulVisits.length / this.impressions.length) * 100,
//       averageReadTime:
//         successfulVisits.reduce((sum, imp) => sum + imp.readTimeSeconds, 0) /
//           successfulVisits.length || 0,
//       uniqueUserAgents: new Set(this.impressions.map((imp) => imp.userAgent))
//         .size,
//       impressionsByHour: this.getImpressionsByHour(),
//       recentImpressions: this.impressions.slice(-10).reverse(), // Last 10, most recent first
//     };

//     return report;
//   }

//   getImpressionsByHour() {
//     const hourlyData = {};
//     this.impressions.forEach((impression) => {
//       const hour =
//         new Date(impression.timestamp).toISOString().slice(0, 13) + ":00:00";
//       hourlyData[hour] = (hourlyData[hour] || 0) + 1;
//     });
//     return hourlyData;
//   }

//   async saveReport(filename = null) {
//     if (filename === null) {
//       filename = `traffic_report_${new Date()
//         .toISOString()
//         .replace(/[:.]/g, "-")}.json`;
//     }

//     const report = this.generateTrafficReport();
//     const reportData = JSON.stringify(report, null, 2);

//     await fs.writeFile(filename, reportData, "utf8");
//     this.logger.info(`Traffic report saved to: ${filename}`);
//     return filename;
//   }

//   async saveImpressions() {
//     const filename = `impressions_${new Date()
//       .toISOString()
//       .replace(/[:.]/g, "-")}.json`;
//     const impressionsData = JSON.stringify(this.impressions, null, 2);
//     await fs.writeFile(filename, impressionsData, "utf8");
//     this.logger.info(`Impressions data saved to: ${filename}`);
//     return filename;
//   }
// }

// module.exports = HumanTrafficGenerator;


// ------------------------------------ OLD


// src/trafficGenerator.js
const axios = require('axios');
const UserAgent = require('user-agents');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;

class HumanTrafficGenerator {
    constructor() {
        this.impressions = [];
        this.setupLogging();
    }

    setupLogging() {
        this.logger = {
            info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
            error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
            warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`)
        };
    }

    validateAndEncodeUrl(url) {
        try {
            // Trim and clean the URL
            const cleanedUrl = url.trim();
            
            // Check if it's a valid URL
            new URL(cleanedUrl);
            return cleanedUrl;
        } catch (error) {
            // If basic validation fails, try to encode it
            try {
                // Encode spaces and special characters
                const encodedUrl = encodeURI(cleanedUrl);
                new URL(encodedUrl);
                this.logger.info(`Encoded URL: ${encodedUrl}`);
                return encodedUrl;
            } catch (encodeError) {
                throw new Error(`Invalid URL format: ${url}`);
            }
        }
    }

    async humanDelay(minSeconds = 2, maxSeconds = 8) {
        const delay = Math.random() * (maxSeconds - minSeconds) + minSeconds;
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
        return delay;
    }

    randomMouseMovements() {
        const movements = [];
        const movementCount = Math.floor(Math.random() * 6) + 3;
        
        for (let i = 0; i < movementCount; i++) {
            movements.push({
                x: Math.floor(Math.random() * 1920),
                y: Math.floor(Math.random() * 1080),
                timestamp: Date.now() + Math.random() * 2000
            });
        }
        return movements;
    }

    getRandomHeaders() {
        const userAgent = new UserAgent();
        return {
            'User-Agent': userAgent.toString(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://www.google.com/'
        };
    }

    getRandomUserAgent() {
        const userAgent = new UserAgent();
        return userAgent.toString();
    }

    isInternalLink(baseUrl, link) {
        try {
            const baseDomain = new URL(baseUrl).hostname;
            const linkDomain = new URL(link, baseUrl).hostname;
            return baseDomain === linkDomain;
        } catch (error) {
            return false;
        }
    }

    async simulatePageInteraction(url, axiosInstance) {
        let response;
        try {
            // Validate and encode URL first
            const validatedUrl = this.validateAndEncodeUrl(url);
            
            // Initial page visit with random headers
            const headers = this.getRandomHeaders();
            
            this.logger.info(`Making request to: ${validatedUrl}`);
            
            response = await axiosInstance.get(validatedUrl, { 
                headers,
                timeout: 30000, // Increased timeout
                maxRedirects: 5,
                validateStatus: function (status) {
                    return status >= 200 && status < 400; // Allow redirects
                }
            });

            // Handle redirects
            if (response.status >= 300 && response.status < 400 && response.headers.location) {
                this.logger.info(`Following redirect to: ${response.headers.location}`);
                response = await axiosInstance.get(response.headers.location, { 
                    headers,
                    timeout: 30000
                });
            }

            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Simulate reading time
            const readTime = await this.humanDelay(3, 15);

            // Try to parse page and potentially click internal links
            try {
                const dom = new JSDOM(response.data);
                const links = dom.window.document.querySelectorAll('a[href]');
                const internalLinks = [];
                
                links.forEach(link => {
                    try {
                        const href = link.href;
                        if (href && this.isInternalLink(validatedUrl, href)) {
                            internalLinks.push(href);
                        }
                    } catch (error) {
                        // Skip invalid URLs
                    }
                });

                // 30% chance to click an internal link
                if (Math.random() < 0.3 && internalLinks.length > 0) {
                    const randomLink = internalLinks[Math.floor(Math.random() * internalLinks.length)];
                    
                    // Delay before clicking
                    await this.humanDelay(1, 3);
                    
                    // Visit the internal link
                    try {
                        await axiosInstance.get(randomLink, { 
                            headers,
                            timeout: 10000 
                        });
                        
                        // Read the new page
                        await this.humanDelay(2, 7);
                    } catch (linkError) {
                        this.logger.warn(`Failed to visit internal link: ${linkError.message}`);
                    }
                }
            } catch (parseError) {
                this.logger.warn(`Page parsing failed, but visit was successful: ${parseError.message}`);
            }

            return {
                success: true,
                contentLength: response.data.length,
                readTime,
                statusCode: response.status
            };

        } catch (error) {
            this.logger.error(`Error visiting ${url}: ${error.message}`);
            return {
                success: false,
                contentLength: 0,
                readTime: 0,
                statusCode: response?.status || 0,
                error: error.message
            };
        }
    }

    generateImpressionData(url, visitResult) {
        const screenResolutions = [
            '1920x1080', '1366x768', '1536x864', '1440x900',
            '1280x720', '1600x900', '1024x768'
        ];

        const languages = ['en-US', 'en-GB', 'en-CA', 'en-AU'];
        const timezones = ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris'];

        const impression = {
            timestamp: new Date().toISOString(),
            url: url,
            success: visitResult.success,
            userAgent: this.getRandomUserAgent(),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
            pageLoadTime: Math.random() * (4.2 - 1.5) + 1.5,
            readTimeSeconds: visitResult.readTime,
            contentLength: visitResult.contentLength,
            mouseMovements: this.randomMouseMovements(),
            scrollDepth: Math.random() * 0.65 + 0.3,
            screenResolution: screenResolutions[Math.floor(Math.random() * screenResolutions.length)],
            language: languages[Math.floor(Math.random() * languages.length)],
            timezone: timezones[Math.floor(Math.random() * timezones.length)],
            statusCode: visitResult.statusCode,
            error: visitResult.error || null
        };

        this.impressions.push(impression);
        return impression;
    }

    async visitUrl(url) {
        this.logger.info(`Starting visit to: ${url}`);

        try {
            // Validate URL before proceeding
            this.validateAndEncodeUrl(url);
        } catch (error) {
            this.logger.error(`URL validation failed: ${error.message}`);
            const failedImpression = this.generateImpressionData(url, {
                success: false,
                contentLength: 0,
                readTime: 0,
                statusCode: 0,
                error: error.message
            });
            return failedImpression;
        }

        // Create new axios instance for this session
        const axiosInstance = axios.create();
        
        // Add random delays to mimic human behavior
        await this.humanDelay(1, 3);

        const visitResult = await this.simulatePageInteraction(url, axiosInstance);
        const impression = this.generateImpressionData(url, visitResult);

        if (visitResult.success) {
            this.logger.info(`Successfully visited ${url} - Read time: ${visitResult.readTime.toFixed(2)}s`);
        } else {
            this.logger.warn(`Failed to visit ${url}: ${visitResult.error}`);
        }

        return impression;
    }

    // ... rest of the methods remain the same
    generateTrafficReport() {
        if (this.impressions.length === 0) {
            return { message: "No impressions recorded yet." };
        }

        const successfulVisits = this.impressions.filter(imp => imp.success);
        const failedVisits = this.impressions.filter(imp => !imp.success);

        const report = {
            generatedAt: new Date().toISOString(),
            totalImpressions: this.impressions.length,
            successfulVisits: successfulVisits.length,
            failedVisits: failedVisits.length,
            successRate: (successfulVisits.length / this.impressions.length) * 100,
            averageReadTime: successfulVisits.reduce((sum, imp) => sum + imp.readTimeSeconds, 0) / successfulVisits.length || 0,
            uniqueUserAgents: new Set(this.impressions.map(imp => imp.userAgent)).size,
            impressionsByHour: this.getImpressionsByHour(),
            recentImpressions: this.impressions.slice(-10).reverse()
        };

        return report;
    }

    getImpressionsByHour() {
        const hourlyData = {};
        this.impressions.forEach(impression => {
            const hour = new Date(impression.timestamp).toISOString().slice(0, 13) + ':00:00';
            hourlyData[hour] = (hourlyData[hour] || 0) + 1;
        });
        return hourlyData;
    }

    async saveReport(filename = null) {
        if (filename === null) {
            filename = `traffic_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        }

        const report = this.generateTrafficReport();
        const reportData = JSON.stringify(report, null, 2);

        await fs.writeFile(filename, reportData, 'utf8');
        this.logger.info(`Traffic report saved to: ${filename}`);
        return filename;
    }

    async saveImpressions() {
        const filename = `impressions_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const impressionsData = JSON.stringify(this.impressions, null, 2);
        await fs.writeFile(filename, impressionsData, 'utf8');
        this.logger.info(`Impressions data saved to: ${filename}`);
        return filename;
    }
}

module.exports = HumanTrafficGenerator;