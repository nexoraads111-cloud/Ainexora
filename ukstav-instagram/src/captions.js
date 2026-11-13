import { BRAND } from "./config.js";

const HASHTAGS = [
  "#ukstav",
  "#bratislava",
  "#slovakia",
  "#stavba",
  "#rekonstrukcia",
  "#domnakluc",
  "#fasada",
  "#zateplenie",
  "#kupelna",
  "#strecha",
  "#interier",
  "#stavebnespolocnost",
].join(" ");

const TEMPLATES = {
  general: (item) =>
    [
      `${item.title || "Ďalší projekt od UKSTAV"}`,
      "",
      item.note ||
        "Kvalitná práca, férové rozpočty a termíny, na ktoré sa dá spoľahnúť.",
      "",
      `📞 ${BRAND.phone}`,
      `🌐 ${BRAND.site}`,
      "Napíšte nám do správy — pripravíme nezáväzný rozpočet.",
      "",
      HASHTAGS,
    ].join("\n"),

  reconstruction: (item) =>
    [
      item.title || "Rekonštrukcia, ktorá zmení bývanie",
      "",
      item.note ||
        "Komplexná rekonštrukcia bytu/domu — od prípravy po odovzdanie. Dbáme na detaily a čistú realizáciu.",
      "",
      "Chcete podobný výsledok u vás?",
      `Zavolajte ${BRAND.phone} alebo napíšte DM.`,
      "",
      HASHTAGS,
    ].join("\n"),

  facade: (item) =>
    [
      item.title || "Fasáda a zateplenie",
      "",
      item.note ||
        "Moderné fasádne systémy a tepelná izolácia — krajší vzhľad a nižšie náklady na energie.",
      "",
      `UKSTAV · ${BRAND.city}`,
      `📞 ${BRAND.phone} · ${BRAND.site}`,
      "",
      HASHTAGS,
    ].join("\n"),

  bathroom: (item) =>
    [
      item.title || "Kúpeľňa na mieru",
      "",
      item.note ||
        "Obklady, dlažby a precízne detaily. Funkčný priestor, ktorý vydrží roky.",
      "",
      "Napíšte nám — dohodneme obhliadku.",
      `📞 ${BRAND.phone}`,
      "",
      HASHTAGS,
    ].join("\n"),

  house: (item) =>
    [
      item.title || "Výstavba domu na kľúč",
      "",
      item.note ||
        "Od základov po kolaudáciu. Transparentný rozpočet a fixné termíny.",
      "",
      `${BRAND.name} · ${BRAND.city}`,
      `🌐 ${BRAND.site}`,
      `📞 ${BRAND.phone}`,
      "",
      HASHTAGS,
    ].join("\n"),

  before_after: (item) =>
    [
      item.title || "Pred a po",
      "",
      item.note ||
        "Takto vyzerá premyslená rekonštrukcia. Rovnakú starostlivosť vieme priniesť aj k vám.",
      "",
      "Nezáväzná konzultácia do 24 hodín.",
      `📞 ${BRAND.phone} · ${BRAND.site}`,
      "",
      HASHTAGS,
    ].join("\n"),
};

/**
 * Build Instagram caption for a queue item.
 * item.caption — if set, used as-is (hashtags appended unless already present)
 * item.template — one of: general | reconstruction | facade | bathroom | house | before_after
 */
export function buildCaption(item) {
  if (item.caption && String(item.caption).trim()) {
    const text = String(item.caption).trim();
    return text.includes("#ukstav") ? text : `${text}\n\n${HASHTAGS}`;
  }
  const key = item.template && TEMPLATES[item.template] ? item.template : "general";
  return TEMPLATES[key](item);
}

export function listTemplates() {
  return Object.keys(TEMPLATES);
}
