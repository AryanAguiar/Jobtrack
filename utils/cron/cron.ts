import cron from 'node-cron';
import { deleteExpiredResumes } from '../dbCleaner';

export function setupCronJobs() {
    cron.schedule('* * * * *', async () => {
        console.log('Running cron job to delete expired resumes...');
        await deleteExpiredResumes();
        console.log('Cron job completed.');
    });
}