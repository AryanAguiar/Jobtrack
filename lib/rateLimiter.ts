import { RateLimiterRedis } from "rate-limiter-flexible";
import client from "./redis";

export const apiLimiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "apiLimiter",
    points: 5, // only 5 requests per minute because i am using a free tier  
    duration: 60, // one minute
})

export const loginLimiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "login-fail",
    points: 10,
    duration: 600,
    blockDuration: 600,
})

export const registerLimiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "register-fail",
    points: 10,
    duration: 600,
    blockDuration: 600,
})

export const resumeUploadLimiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "resume-upload",
    points: 20,
    duration: 86400,
    blockDuration: 86400,
})