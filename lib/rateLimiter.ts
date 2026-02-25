import { RateLimiterRedis } from "rate-limiter-flexible";
import client from "./redis";

export const apiLimiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "apiLimiter",
    points: 5, // only 5 requests per minute because i am using a free tier  
    duration: 60,
})

export const loginLimiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "login-fail", //temp values
    points: 2,
    duration: 5,
    blockDuration: 5,
})

export const registerLimiter = new RateLimiterRedis({
    storeClient: client,
    keyPrefix: "register-fail",
    points: 2,
    duration: 5,
    blockDuration: 5,
})