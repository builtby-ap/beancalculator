/**
 * Persistent storage utility
 *
 * On Vercel (when KV_REST_API_URL is set): uses Upstash Redis
 * Locally / without Redis: uses in-memory storage
 */

let redis = null;

try {
  // Only require @upstash/redis if it's actually installed
  const upstash = require("@upstash/redis");
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    redis = new upstash.Redis({ url, token });
    console.log("✅ Using Upstash Redis for persistent storage");
  }
} catch (e) {
  console.log("ℹ️ Using in-memory storage (Redis not available)");
}

const memory = {};

async function _redisRead(key) {
  if (!redis) return null;
  try { const data = await redis.get(key); return data ? JSON.parse(data) : null; }
  catch (e) { return null; }
}

async function _redisWrite(key, data) {
  if (!redis) return;
  try { await redis.set(key, JSON.stringify(data)); } catch (e) {}
}

async function readJSON(key) {
  if (redis) {
    const val = await _redisRead(key);
    if (val !== null && val !== undefined) return val;
  }
  return memory[key] || null;
}

async function writeJSON(key, data) {
  memory[key] = data;
  if (redis) await _redisWrite(key, data);
}

module.exports = { readJSON, writeJSON };
