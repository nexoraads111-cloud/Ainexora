import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Load simple KEY=VALUE .env if present (no extra dependencies). */
function loadEnvFile() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

export const ROOT = root;
export const QUEUE_PATH = join(root, "content", "queue.json");
export const POSTED_PATH = join(root, "content", "posted.json");

export function getCredentials() {
  const igUserId = process.env.IG_USER_ID?.trim();
  const accessToken = process.env.PAGE_ACCESS_TOKEN?.trim();
  if (!igUserId || !accessToken) {
    throw new Error(
      "Missing IG_USER_ID or PAGE_ACCESS_TOKEN. Copy .env.example → .env and fill values (or set GitHub Secrets)."
    );
  }
  return { igUserId, accessToken };
}

export const BRAND = {
  name: "UKSTAV SLOVAKIA",
  site: "https://ukstav.sk",
  phone: "+421 950 405 659",
  city: "Bratislava",
};
