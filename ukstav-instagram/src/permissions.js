/** Permissions required to list Pages and publish Instagram feed photos. */
export const REQUIRED_PERMISSIONS = [
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
];

/** Permissions that mean the app/token is WhatsApp-only (common uk_stav mistake). */
export const WHATSAPP_ONLY_HINTS = [
  "whatsapp_business_management",
  "whatsapp_business_messaging",
];

export function analyzePermissions(grantedNames) {
  const granted = new Set(grantedNames.map((n) => n.toLowerCase()));
  const missing = REQUIRED_PERMISSIONS.filter((p) => !granted.has(p));
  const hasWhatsapp = WHATSAPP_ONLY_HINTS.some((p) => granted.has(p));
  const hasInstagram = granted.has("instagram_basic") || granted.has("instagram_content_publish");
  const hasPages = granted.has("pages_show_list");

  return {
    granted: [...granted],
    missing,
    hasWhatsapp,
    hasInstagram,
    hasPages,
    readyForPublish: missing.length === 0,
  };
}
