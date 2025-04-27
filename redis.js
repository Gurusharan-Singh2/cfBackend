import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis-16654.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
  port: 16654,
  password: process.env.REDIS_PASS, // Replace with your real password

});

export default redis