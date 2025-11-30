import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

export function createRedisConnection(redisUrl) {
  return new IORedis(redisUrl);
}
