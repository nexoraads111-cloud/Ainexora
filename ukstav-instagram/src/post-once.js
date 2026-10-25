import { getCredentials } from "./config.js";
import { buildCaption } from "./captions.js";
import { pickNextItem, markPosted } from "./queue.js";
import { publishImage } from "./instagram.js";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const { item } = pickNextItem();

  if (!item) {
    console.log("Queue is empty (all items already posted). Add more photos to content/queue.json");
    process.exit(0);
  }

  const caption = buildCaption(item);

  console.log("— UKSTAV Instagram post —");
  console.log(`id:        ${item.id}`);
  console.log(`imageUrl:  ${item.imageUrl}`);
  console.log(`template:  ${item.template || "general"}`);
  console.log("caption:");
  console.log(caption);
  console.log("—");

  if (dryRun) {
    console.log("Dry-run only — nothing published.");
    return;
  }

  if (!item.imageUrl || item.imageUrl.includes("REPLACE_WITH_PUBLIC_PHOTO_URL")) {
    throw new Error(
      `Queue item ${item.id} needs a real public https imageUrl (not REPLACE_WITH_PUBLIC_PHOTO_URL)`
    );
  }
  if (!/^https:\/\//i.test(item.imageUrl)) {
    throw new Error(`Queue item ${item.id}: imageUrl must start with https://`);
  }

  const { igUserId, accessToken } = getCredentials();
  const result = await publishImage({
    igUserId,
    accessToken,
    imageUrl: item.imageUrl,
    caption,
  });

  markPosted(item, { mediaId: result.mediaId, creationId: result.creationId });
  console.log(`Published. mediaId=${result.mediaId}`);
}

main().catch((err) => {
  console.error("Post failed:", err.message);
  if (err.details) console.error(JSON.stringify(err.details, null, 2));
  process.exit(1);
});
