const { createClient } = require('redis');

let redisClient = null;
let isRedisConnected = false;
const memoryCache = new Map();

const initCache = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('No REDIS_URL provided. Falling back to in-memory stateless cache.');
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('Redis connection failed after 3 retries. Caching will use in-memory fallback.');
            return new Error('Max retries reached');
          }
          return 3000;
        },
      },
    });
    redisClient.on('error', (err) => {
      console.warn('Redis client error:', err.message);
      isRedisConnected = false;
    });
    redisClient.on('connect', () => {
      console.log('Redis client connecting...');
    });
    redisClient.on('ready', () => {
      console.log('Redis Connected Successfully.');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.warn('Could not initialize Redis client. Caching will use in-memory fallback:', error.message);
    isRedisConnected = false;
  }
};

const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      console.error('Redis GET error:', err.message);
    }
  }

  // Memory cache fallback
  const cached = memoryCache.get(key);
  if (cached) {
    if (cached.expiry && cached.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }
  return null;
};

const setCache = async (key, value, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
      return;
    } catch (err) {
      console.error('Redis SET error:', err.message);
    }
  }

  // Memory cache fallback
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

const delCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.error('Redis DEL error:', err.message);
    }
  }

  memoryCache.delete(key);
};

const clearCache = async () => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.flushAll();
      return;
    } catch (err) {
      console.error('Redis FLUSHALL error:', err.message);
    }
  }
  memoryCache.clear();
};

module.exports = {
  initCache,
  getCache,
  setCache,
  delCache,
  clearCache,
};
