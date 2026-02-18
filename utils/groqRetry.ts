export async function groqRetry<T>(fn: () => Promise<T>, retries = 2, delay = 100): Promise<T> {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (err) {
            if (attempt >= retries) throw err;
            attempt++;
            const backoff = delay * 2 ** (attempt - 1);
            console.log(`Attempt ${attempt} failed. Retrying in ${backoff}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
        }
    }
}