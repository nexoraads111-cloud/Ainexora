# UKSTAV Instagram autoposter (free)

Daily Instagram posts for **UKSTAV SLOVAKIA** via official Meta Graph API.  
No Buffer, Later, or other paid SMM tools.

## Start here (Ukrainian)

If Graph API Explorer shows only WhatsApp permissions / “nothing there” for Instagram — read:

**[SETUP-UA.md](./SETUP-UA.md)**

That guide covers: add Instagram product to app `uk_stav`, link Facebook Page, new token, GitHub Secrets.

## What is included
- Photo queue: `content/queue.json`
- Slovak captions: `src/captions.js`
- Publish script: `src/post-once.js`
- Token diagnostics: `npm run diagnose`
- Readiness check: `npm run check-ready`
- Free daily cron: `.github/workflows/ukstav-daily-instagram.yml`

## Quick commands

```bash
cd ukstav-instagram
cp .env.example .env
# paste token into PAGE_ACCESS_TOKEN=

npm run diagnose      # permissions + Page + IG_USER_ID
npm run whoami        # short IG id printout
npm run check-ready   # .env + next photo URL
npm run dry-run       # caption preview, no publish
npm run post          # real Instagram publish
```

## GitHub Secrets
Repository → Settings → Secrets and variables → Actions:
- `PAGE_ACCESS_TOKEN`
- `IG_USER_ID`

Do not commit tokens. Workflow: **UKSTAV daily Instagram** (~08:00 Bratislava or Run workflow).

## Queue item format

```json
{
  "id": "2026-010",
  "enabled": true,
  "template": "reconstruction",
  "title": "Nadpis",
  "note": "Krátky popis práce",
  "imageUrl": "https://.../foto.jpg"
}
```

Templates: `general`, `reconstruction`, `facade`, `bathroom`, `house`, `before_after`  
Or set custom `caption`.

Contact in captions: **+421 950 405 659** · [ukstav.sk](https://ukstav.sk)
