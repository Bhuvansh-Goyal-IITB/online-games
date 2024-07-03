import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_CONNECTION_URL!);
const subscriber = new Redis(process.env.REDIS_CONNECTION_URL!);

export { redis, subscriber };
