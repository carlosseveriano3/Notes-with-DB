import { createClient } from 'redis';

// Create and configure Redis client
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
export { redisClient }

//await redisClient.connect();