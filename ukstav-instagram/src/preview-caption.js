import { pickNextItem } from "./queue.js";
import { buildCaption, listTemplates } from "./captions.js";

const { item } = pickNextItem();
console.log("Templates:", listTemplates().join(", "));
console.log("");

if (!item) {
  console.log("No pending queue items.");
  process.exit(0);
}

console.log(`Next item: ${item.id}`);
console.log(buildCaption(item));
