const GRAPH = "https://graph.facebook.com/v21.0";

async function graph(path, { method = "GET", token, body, fields } = {}) {
  const url = new URL(`${GRAPH}${path}`);
  if (method === "GET") {
    url.searchParams.set("access_token", token);
    if (fields) url.searchParams.set("fields", fields);
  }

  const res = await fetch(url, {
    method,
    headers: method === "GET" ? undefined : { "Content-Type": "application/json" },
    body:
      method === "GET"
        ? undefined
        : JSON.stringify({ ...(body || {}), access_token: token }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || res.statusText || "Graph API error";
    const err = new Error(msg);
    err.details = data;
    throw err;
  }
  return data;
}

/** Create image container, wait until finished, publish. */
export async function publishImage({ igUserId, accessToken, imageUrl, caption }) {
  const container = await graph(`/${igUserId}/media`, {
    method: "POST",
    token: accessToken,
    body: {
      image_url: imageUrl,
      caption,
    },
  });

  const creationId = container.id;
  if (!creationId) throw new Error("No creation_id from /media");

  await waitUntilReady(creationId, accessToken);

  const published = await graph(`/${igUserId}/media_publish`, {
    method: "POST",
    token: accessToken,
    body: { creation_id: creationId },
  });

  return { creationId, mediaId: published.id };
}

async function waitUntilReady(creationId, accessToken, { tries = 12, delayMs = 3000 } = {}) {
  for (let i = 0; i < tries; i++) {
    let status;
    try {
      status = await graph(`/${creationId}`, {
        method: "GET",
        token: accessToken,
        fields: "status_code",
      });
    } catch {
      // Some tokens omit status_code; proceed to publish after a short wait.
      await sleep(delayMs);
      return null;
    }
    const code = status.status_code;
    if (!code || code === "FINISHED" || code === "PUBLISHED") return status;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`Media container failed: ${code}`);
    }
    await sleep(delayMs);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** List granted OAuth permissions for this token. */
export async function getPermissions(accessToken) {
  const data = await graph("/me/permissions", { token: accessToken });
  const rows = data.data || [];
  return {
    granted: rows.filter((p) => p.status === "granted").map((p) => p.permission),
    declined: rows.filter((p) => p.status === "declined").map((p) => p.permission),
    raw: rows,
  };
}

/**
 * Resolve Facebook Pages and linked Instagram business accounts for a token.
 * Works with a User token (lists pages) or falls back for Page tokens via probePageToken.
 */
export async function discoverAccounts(accessToken) {
  const me = await graph("/me", { token: accessToken, fields: "id,name" });
  const pages = await graph("/me/accounts", {
    token: accessToken,
    fields: "id,name,access_token",
  });

  const detailed = [];
  for (const page of pages.data || []) {
    const pageToken = page.access_token || accessToken;
    const pageInfo = await graph(`/${page.id}`, {
      token: pageToken,
      fields: "name,instagram_business_account",
    });

    detailed.push({
      pageId: page.id,
      pageName: page.name || pageInfo.name,
      pageAccessToken: page.access_token,
      igUserId: pageInfo.instagram_business_account?.id || null,
    });
  }

  return { user: me, pages: detailed };
}

/** When /me is already a Page (page access token). */
export async function probePageToken(accessToken) {
  const data = await graph("/me", {
    token: accessToken,
    fields: "id,name,instagram_business_account",
  });
  return {
    pageId: data.id,
    pageName: data.name,
    pageAccessToken: accessToken,
    igUserId: data.instagram_business_account?.id || null,
  };
}
