import { setupCronJobs } from "./cron";

let started = false;

export function initServer() {
    if (!started) {
        console.log("Starting cron jobs...");
        setupCronJobs();
        started = true;
    }
}