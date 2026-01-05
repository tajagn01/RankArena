import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

export function createRedisConnection(redisUrl) {
  const redis = new IORedis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      // Stop retrying after 3 attempts
      if (times > 3) {
        console.warn('⚠️  Redis connection failed - running without cache');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
    lazyConnect: true, // Don't auto-connect
    enableOfflineQueue: false, // Don't queue commands when offline
  });

  // Handle connection errors gracefully
  redis.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.warn('⚠️  Redis not available - caching disabled');
    }
  });

  // Try to connect, but don't fail if it doesn't work
  redis.connect().catch(() => {
    console.warn('⚠️  Redis connection failed - running without cache');
  });

  return redis;
}
