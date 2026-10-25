/**
 * Local readiness check before a real Instagram test post.
 */
import { existsSync, readFileSync } from "node:fs";
import { getCredentials, QUEUE_PATH, ROOT } from "./config.js";
import { pickNextItem } from "./queue.js";
import { REQUIRED_PERMISSIONS } from "./permissions.js";

function ok(m) {
  console.log(`OK  ${m}`);
}
function bad(m) {
  console.log(`!!  ${m}`);
}
function tip(m) {
  console.log(`→   ${m}`);
}

let failed = false;

function fail(msg, hint) {
  failed = true;
  bad(msg);
  if (hint) tip(hint);
}

console.log("UKSTAV Instagram — check-ready");
console.log(`root: ${ROOT}`);
console.log("");

// 1) credentials
try {
  const { igUserId, accessToken } = getCredentials();
  ok(`IG_USER_ID set (${igUserId})`);
  ok(`PAGE_ACCESS_TOKEN set (len=${accessToken.length})`);
} catch (err) {
  fail(err.message, "Скопіюй .env.example → .env або задай GitHub Secrets. Див. SETUP-UA.md");
}

// 2) queue photo
const { item } = pickNextItem();
if (!item) {
  fail("Черга порожня — всі items уже в posted.json", "Додай нові фото в content/queue.json");
} else if (!item.imageUrl || item.imageUrl.includes("REPLACE_WITH_PUBLIC_PHOTO_URL")) {
  fail(
    `Наступний пост ${item.id} ще без реального imageUrl`,
    "Потрібен публічний https://... до фото роботи (не логін Instagram)"
  );
} else if (!/^https:\/\//i.test(item.imageUrl)) {
  fail(`imageUrl має починатись з https:// (${item.id})`);
} else {
  ok(`Наступний пост: ${item.id}`);
  ok(`imageUrl: ${item.imageUrl}`);
}

// 3) queue file present
if (!existsSync(QUEUE_PATH)) {
  fail("Немає content/queue.json");
} else {
  const q = JSON.parse(readFileSync(QUEUE_PATH, "utf8"));
  ok(`У черзі items: ${(q.items || []).length}`);
}

console.log("");
console.log("Потрібні Meta permissions:");
for (const p of REQUIRED_PERMISSIONS) console.log(`  - ${p}`);
tip("Повна діагностика токена: npm run diagnose");
tip("Гід українською: SETUP-UA.md");

console.log("");
if (failed) {
  bad("Ще НЕ готово до реального поста.");
  process.exit(1);
}
ok("Локально готово. Запусти: npm run diagnose && npm run dry-run && npm run post");
