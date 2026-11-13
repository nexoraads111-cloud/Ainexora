/**
 * Diagnose Meta token for UKSTAV Instagram publishing.
 * Prints clear next steps in Ukrainian when something is missing.
 */
import "./config.js";
import { analyzePermissions } from "./permissions.js";
import { getPermissions, discoverAccounts, probePageToken } from "./instagram.js";

function section(title) {
  console.log("");
  console.log(`=== ${title} ===`);
}

function ok(msg) {
  console.log(`OK  ${msg}`);
}

function bad(msg) {
  console.log(`!!  ${msg}`);
}

function tip(msg) {
  console.log(`→   ${msg}`);
}

async function main() {
  const token = process.env.PAGE_ACCESS_TOKEN?.trim() || process.env.USER_ACCESS_TOKEN?.trim();
  if (!token) {
    bad("Немає PAGE_ACCESS_TOKEN (або USER_ACCESS_TOKEN) у .env");
    tip("Скопіюй .env.example → .env і встав новий токен після SETUP-UA.md");
    tip("Гід: ukstav-instagram/SETUP-UA.md");
    process.exit(1);
  }

  section("1) Токен");
  let permissions;
  try {
    permissions = await getPermissions(token);
    ok(`Токен відповідає. Дозволів granted: ${permissions.granted.length}`);
  } catch (err) {
    bad(`Токен недійсний або відхилений: ${err.message}`);
    tip("У Graph API Explorer натисни «Згенерувати токен доступу» знову.");
    tip("Див. SETUP-UA.md розділ 3.");
    process.exit(1);
  }

  const analysis = analyzePermissions(permissions.granted);
  console.log(`    granted: ${permissions.granted.join(", ") || "(немає)"}`);

  section("2) Дозволи для Instagram");
  if (analysis.readyForPublish) {
    ok("Усі потрібні дозволи є.");
  } else {
    bad(`Не вистачає: ${analysis.missing.join(", ")}`);
    if (analysis.hasWhatsapp && !analysis.hasInstagram) {
      bad("Зараз схоже на WhatsApp-only токен (типова проблема додатку uk_stav).");
      tip("Спочатку: developers.facebook.com/apps → uk_stav → Додати продукт → Instagram Graph API");
      tip("Потім у Explorer додай дозволи зі списку вище і згенеруй НОВИЙ токен.");
    } else if (!analysis.hasInstagram) {
      tip("Додай продукт Instagram у додаток uk_stav, інакше в Explorer не буде instagram_ дозволів.");
      tip("SETUP-UA.md → розділ 1");
    }
    if (!analysis.hasPages) {
      tip("Потрібен pages_show_list, інакше список Facebook Page буде порожній.");
    }
  }

  section("3) Facebook Page + Instagram");
  let pages = [];
  let userLabel = null;

  try {
    const discovered = await discoverAccounts(token);
    userLabel = `${discovered.user.name || "?"} (${discovered.user.id})`;
    pages = discovered.pages;
    ok(`Meta user: ${userLabel}`);
  } catch (err) {
    // Might be a page token — try probe
    try {
      const page = await probePageToken(token);
      pages = [page];
      ok(`Це Page token: ${page.pageName} (${page.pageId})`);
    } catch (err2) {
      bad(`Не вдалося прочитати Page: ${err.message || err2.message}`);
      tip("Переконайся, що Instagram Business прив’язаний до Facebook Page (SETUP-UA.md §2).");
      process.exit(1);
    }
  }

  if (!pages.length) {
    bad("Facebook Page не знайдено (me/accounts порожній).");
    tip("Створи/відкрий Page UKSTAV і прив’яжи Instagram Business.");
    tip("Токен має бути згенерований з доступом саме до цієї Page.");
    tip("SETUP-UA.md → розділ 2");
    process.exit(1);
  }

  let best = null;
  for (const page of pages) {
    const ig = page.igUserId ? `IG_USER_ID=${page.igUserId}` : "Instagram НЕ прив’язаний";
    console.log(`    Page: ${page.pageName} (${page.pageId}) — ${ig}`);
    if (page.igUserId && !best) best = page;
  }

  if (!best) {
    bad("Page є, але Instagram Business Account не прив’язаний.");
    tip("Instagram → професійний акаунт → зв’язок із Facebook Page UKSTAV.");
    process.exit(1);
  }

  section("4) Готово до постів");
  ok(`IG_USER_ID=${best.igUserId}`);
  if (best.pageAccessToken && best.pageAccessToken !== token) {
    tip("Для GitHub Secret PAGE_ACCESS_TOKEN краще взяти Page access token (довший термін).");
  }

  console.log("");
  console.log("Запиши в .env / GitHub Secrets:");
  console.log(`IG_USER_ID=${best.igUserId}`);
  console.log("PAGE_ACCESS_TOKEN=<page access token>");
  console.log("");
  tip("Далі: npm run check-ready  →  додай https URL фото в content/queue.json  →  npm run dry-run");
  tip("Секрети: GitHub → Settings → Secrets → Actions (IG_USER_ID, PAGE_ACCESS_TOKEN)");

  if (!analysis.readyForPublish) {
    console.log("");
    bad("Page/IG знайдені, але дозволів для publish ще бракує — згенеруй токен з повним списком.");
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err.message);
  if (err.details) console.error(JSON.stringify(err.details, null, 2));
  process.exit(1);
});
