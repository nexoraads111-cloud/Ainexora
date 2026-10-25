import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { QUEUE_PATH, POSTED_PATH } from "./config.js";

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadQueue() {
  const data = readJson(QUEUE_PATH, { items: [] });
  if (!Array.isArray(data.items)) {
    throw new Error("content/queue.json must have an \"items\" array");
  }
  return data;
}

export function loadPosted() {
  return readJson(POSTED_PATH, { items: [] });
}

/** Next unpublished item (or FORCE_ITEM_ID). */
export function pickNextItem() {
  const queue = loadQueue();
  const posted = loadPosted();
  const postedIds = new Set(posted.items.map((p) => p.id));

  const forceId = process.env.FORCE_ITEM_ID?.trim();
  if (forceId) {
    const forced = queue.items.find((i) => i.id === forceId);
    if (!forced) throw new Error(`FORCE_ITEM_ID not found in queue: ${forceId}`);
    return { item: forced, queue, posted };
  }

  const item = queue.items.find((i) => i.enabled !== false && !postedIds.has(i.id));
  return { item: item || null, queue, posted };
}

export function markPosted(item, meta = {}) {
  const posted = loadPosted();
  posted.items.push({
    id: item.id,
    imageUrl: item.imageUrl,
    postedAt: new Date().toISOString(),
    ...meta,
  });
  writeJson(POSTED_PATH, posted);
  return posted;
}
