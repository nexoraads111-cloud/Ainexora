# Підключення Instagram для UKSTAV (токен)

Простий гід українською. Без Buffer/Later — лише офіційний Meta.

**Чому в Graph API Explorer «нічого немає»?**  
Додаток **uk_stav** спочатку мав лише WhatsApp. Поки не додаси продукт **Instagram**, у «Додати дозвіл» не буде `instagram_...`. Це нормально.

Старі токени з чату / з помилкою **190 (недійсний)** більше не використовуй.

---

## 1) Додати Instagram у додаток uk_stav

1. Відкрий https://developers.facebook.com/apps  
2. Зайди в додаток **uk_stav**  
3. Знайди **Додати продукти** / Add products  
4. **Instagram** або **Instagram Graph API** → **Set up** / Налаштувати  
5. Бажано також додати **Facebook Login** (для токена сторінки)

Після цього повернись у Graph API Explorer — у пошуку дозволів з’являться Instagram і Pages.

---

## 2) Facebook Page + Instagram Business

Без цього API не побачить акаунт (раніше `me/accounts` був порожній).

- Instagram UKSTAV = **Professional / Business**
- Прив’язаний до **Facebook Page** UKSTAV  
- Facebook Анатолія = **адмін** цієї Page  

Перевірка в Instagram (телефон): Профіль → меню → центр професійного доступу / зв’язок із Facebook → має бути сторінка фірми.

---

## 3) Новий токен

1. https://developers.facebook.com/tools/explorer  
2. **Мета-додаток:** `uk_stav`  
3. **Додати дозвіл** — потрібні:
   - `pages_show_list`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
4. Синя кнопка **Згенерувати токен доступу**  
5. Підтверди доступ до **сторінки UKSTAV**  
6. Скопіюй новий довгий рядок  

Кнопку **Надіслати** (`/me?fields=id,name`) тисни лише після нового токена — має показати ім’я без помилки 190.

Перевірка з комп’ютера / у репо:

```bash
cd ukstav-instagram
cp .env.example .env
# встав токен у PAGE_ACCESS_TOKEN=
npm run diagnose
```

Скрипт скаже, чого не вистачає, і надрукує `IG_USER_ID`, якщо все ок.

---

## 4) GitHub Secrets (щоденний автопост)

У репозиторії Ainexora → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|------|--------|
| `PAGE_ACCESS_TOKEN` | токен сторінки (краще Page token з `npm run diagnose`) |
| `IG_USER_ID` | число з виводу diagnose / whoami |

**Не коміть** токен у git і не клади в README.

Потім у `content/queue.json` заміни `REPLACE_WITH_PUBLIC_PHOTO_URL` на публічні https-посилання фото робіт.

Запуск: Actions → **UKSTAV daily Instagram** → **Run workflow**, або дочекайся cron (~08:00 Братислава).

---

## Швидкі команди

```bash
npm run diagnose    # перевірка токена, Page, Instagram, дозволів
npm run whoami      # коротко: IG_USER_ID
npm run check-ready # чи готові .env + черга до тестового поста
npm run dry-run     # текст наступного поста без публікації
npm run post        # реальний пост у Instagram
```
