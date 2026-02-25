import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL as string);

export default client;