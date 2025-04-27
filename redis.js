// lib/redis.js
import 'dotenv/config'; // Load your .env first
import Redis from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: 'redis-16654.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 16654,
  password: process.env.REDIS_PASS,
  
});

// Optional: Logs
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;
