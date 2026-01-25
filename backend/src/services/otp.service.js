import crypto from "crypto";
import { createRedisConnection } from "../config/redis.js";
import dotenv from "dotenv";

dotenv.config();

const redis = createRedisConnection(process.env.REDIS_URL || "redis://localhost:6379");

// In-memory fallback if Redis is disabled/fails
const memoryStore = new Map();

export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const storeOtp = async (email, otp, userData) => {
    const key = `otp:${email}`;
    const data = JSON.stringify({ otp, userData });

    try {
        if (redis && redis.status === 'ready') {
            await redis.setex(key, 600, data);
            return true;
        } else {
            throw new Error("Redis not ready");
        }
    } catch (err) {
        console.warn("⚠️ Redis unavailable, using in-memory store for OTP (restart will clear data)");
        memoryStore.set(key, { data, expires: Date.now() + 600000 });
        return true;
    }
};

export const verifyOtp = async (email, otp) => {
    const key = `otp:${email}`;
    let dataString = null;

    try {
        if (redis && redis.status === 'ready') {
            dataString = await redis.get(key);
        } else {
            throw new Error("Redis not ready");
        }
    } catch (err) {
        const record = memoryStore.get(key);
        if (record) {
            if (record.expires > Date.now()) {
                dataString = record.data;
            } else {
                memoryStore.delete(key);
            }
        }
    }

    if (!dataString) {
        return { success: false, message: "OTP expired or not found" };
    }

    const data = JSON.parse(dataString);
    if (data.otp === otp) {
        // Return user data so we can complete registration
        // We don't delete immediately to prevent race conditions or if we want to allow re-verify? 
        // Usually burn after verify.
        try {
            if (redis && redis.status === 'ready') await redis.del(key);
        } catch (e) { }

        memoryStore.delete(key);

        return { success: true, userData: data.userData };
    }

    return { success: false, message: "Invalid OTP" };
};
