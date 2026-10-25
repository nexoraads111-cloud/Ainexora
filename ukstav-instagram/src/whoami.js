import { discoverAccounts } from "./instagram.js";
import "./config.js";

const GRAPH = "https://graph.facebook.com/v21.0";

async function main() {
  const token = process.env.PAGE_ACCESS_TOKEN?.trim() || process.env.USER_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("Set PAGE_ACCESS_TOKEN (or USER_ACCESS_TOKEN) in .env first");
  }

  // Try user-token discovery first (lists all pages).
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
        console.log("Suggested .env:");
        console.log(`IG_USER_ID=${withIg.igUserId}`);
        console.log("PAGE_ACCESS_TOKEN=<page access token>");
      }
      return;
    }
  } catch {
    // Fall through — token may already be a Page token.
  }

  // Page-token path: /me is the page.
  const meUrl = new URL(`${GRAPH}/me`);
  meUrl.searchParams.set("fields", "id,name,instagram_business_account");
  meUrl.searchParams.set("access_token", token);
  const res = await fetch(meUrl);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  console.log(`Page: ${data.name} (${data.id})`);
  const ig = data.instagram_business_account?.id;
  console.log(`IG_USER_ID: ${ig || "— not linked —"}`);
  if (ig) {
    console.log("");
    console.log("Suggested .env:");
    console.log(`IG_USER_ID=${ig}`);
    console.log("PAGE_ACCESS_TOKEN=<this page token>");
  }
}

main().catch((err) => {
  console.error(err.message);
  if (err.details) console.error(JSON.stringify(err.details, null, 2));
  process.exit(1);
});
