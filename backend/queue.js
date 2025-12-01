const Bull = require('bull');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const queuePrefix = process.env.REDIS_QUEUE_PREFIX || 'kzstore:';

// Only connect to Redis if URL is explicitly provided
let connection = null;
let whatsappQueue = null;

if (process.env.REDIS_URL) {
  try {
    connection = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 5000,
    });
    
    connection.on('error', (err) => {
      console.warn('Redis connection error (queue disabled):', err.message);
    });
    
    whatsappQueue = new Bull('whatsapp', { redis: redisUrl, prefix: queuePrefix });
    console.log('✅ WhatsApp queue enabled with Redis');
  } catch (err) {
    console.warn('Failed to initialize Redis queue:', err.message);
  }
} else {
  console.log('⚠️  Redis not configured - WhatsApp queue disabled (messages will be sent directly)');
}

module.exports = { whatsappQueue, connection };
