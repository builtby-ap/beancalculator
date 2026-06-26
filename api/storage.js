/**
 * Persistent storage utility
 *
 * On Vercel (when REDIS_URL / KV_URL is set): uses Upstash Redis
 * Locally: uses in-memory storage with initialization from seed data
 */

const { Redis } = require("@upstash/redis");

let redis = null;
try {
  // KV_REST_API_URL and KV_REST_API_TOKEN are auto-injected by Vercel KV integration
  const url = process.env.KV_REST_API_URL || process.env.REDIS_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.REDIS_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
    console.log("✅ Using Upstash Redis for persistent storage");
  }
} catch (e) {
  console.log("⚠️ Redis not configured, using in-memory storage");
}

// In-memory fallback
const memory = {};

async function _redisRead(key) {
  if (!redis) return null;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function _redisWrite(key, data) {
  if (!redis) return;
  await redis.set(key, JSON.stringify(data));
}

// ── Public API ──

async function readJSON(key) {
  if (redis) {
    const val = await _redisRead(key);
    if (val !== null) return val;
  }
  return memory[key] || null;
}

async function writeJSON(key, data) {
  memory[key] = data;
  if (redis) {
    await _redisWrite(key, data);
  }
}

function getMemory() {
  return memory;
}

module.exports = { readJSON, writeJSON, getMemory };
