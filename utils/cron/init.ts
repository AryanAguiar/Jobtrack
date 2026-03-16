import { setupCronJobs } from "./cron";

declare global {
    var cronStarted: boolean | undefined;
}

export function initServer() {
    // Only run on server and only once
    if (typeof window === 'undefined' && !global.cronStarted) {
        console.log("Starting cron jobs...");
        setupCronJobs();
        global.cronStarted = true;
    }
}