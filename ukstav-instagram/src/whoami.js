/**
 * Short helper: print IG_USER_ID for .env / GitHub Secrets.
 * For full Ukrainian diagnostics use: npm run diagnose
 */
import "./config.js";
import { discoverAccounts, probePageToken } from "./instagram.js";

async function main() {
  const token = process.env.PAGE_ACCESS_TOKEN?.trim() || process.env.USER_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("Set PAGE_ACCESS_TOKEN (or USER_ACCESS_TOKEN) in .env first — see SETUP-UA.md");
  }

  try {
    const { user, pages } = await discoverAccounts(token);
    console.log(`Meta user: ${user.name || "?"} (${user.id})`);
    console.log("");

    if (pages.length) {
      for (const page of pages) {
        console.log(`Page: ${page.pageName} (${page.pageId})`);
        console.log(`  IG_USER_ID: ${page.igUserId || "— not linked —"}`);
        console.log("");
      }
      const withIg = pages.find((p) => p.igUserId);
      if (withIg) {
        console.log("Suggested .env / GitHub Secrets:");
        console.log(`IG_USER_ID=${withIg.igUserId}`);
        console.log("PAGE_ACCESS_TOKEN=<page access token>");
        return;
      }
      console.log("Pages found but Instagram is not linked. See SETUP-UA.md section 2.");
      process.exit(1);
    }
  } catch {
    // Fall through — token may already be a Page token.
  }

  const page = await probePageToken(token);
  console.log(`Page: ${page.pageName} (${page.pageId})`);
  console.log(`IG_USER_ID: ${page.igUserId || "— not linked —"}`);
  if (!page.igUserId) {
    console.log("Instagram not linked to this Page. See SETUP-UA.md section 2.");
    process.exit(1);
  }
  console.log("");
  console.log("Suggested .env / GitHub Secrets:");
  console.log(`IG_USER_ID=${page.igUserId}`);
  console.log("PAGE_ACCESS_TOKEN=<this page token>");
}

main().catch((err) => {
  console.error(err.message);
  if (err.details) console.error(JSON.stringify(err.details, null, 2));
  console.error("Full check: npm run diagnose  |  Guide: SETUP-UA.md");
  process.exit(1);
});
