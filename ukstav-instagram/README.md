# UKSTAV Instagram autoposter (bezplatne)

Každý deň zverejní 1 príspevok na Instagram UKSTAV cez oficiálne **Meta Graph API**.  
Žiadny Buffer, Later ani iné platené nástroje.

## Čo je hotové
- fronta fotiek (`content/queue.json`)
- slovenské texty + hashtagy (`src/captions.js`)
- publikácia cez Instagram API (`src/post-once.js`)
- denný cron zadarmo cez GitHub Actions

## Čo treba od vás (raz)

### 1) Meta token
1. [developers.facebook.com](https://developers.facebook.com) → Create App (Business)
2. Instagram účet musí byť **Business** a napojený na **Facebook Page**
3. Graph API Explorer → token s právami:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
4. V priečinku `ukstav-instagram`:

```bash
cp .env.example .env
# vlož USER/PAGE token do PAGE_ACCESS_TOKEN
node src/whoami.js
```

Skript vypíše `IG_USER_ID`. Doplň ho do `.env`.

### 2) Fotky
Do `content/queue.json` daj **verejné https URL** fotiek (Imgur, Google Drive priamy odkaz, Cloudinary free, vlastný hosting…).  
Nahraď `REPLACE_WITH_PUBLIC_PHOTO_URL`.

### 3) GitHub Secrets (pre denný auto-post)
V repozitári → Settings → Secrets → Actions:
- `IG_USER_ID`
- `PAGE_ACCESS_TOKEN`

Workflow: `.github/workflows/ukstav-daily-instagram.yml`  
Štart: každý deň ~08:00 Bratislava, alebo ručne **Run workflow**.

## Lokálne príkazy

```bash
cd ukstav-instagram
node src/preview-caption.js   # ukáž text ďalšieho postu
node src/post-once.js --dry-run
node src/post-once.js         # skutočne zverejní
```

## Formát položky vo fronte

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

Šablóny: `general`, `reconstruction`, `facade`, `bathroom`, `house`, `before_after`  
Alebo vlastný text cez pole `caption`.

Kontakt v textoch: **+421 950 405 659** · [ukstav.sk](https://ukstav.sk)
