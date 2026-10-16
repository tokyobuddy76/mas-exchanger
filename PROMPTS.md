# Project Prompts & Chat History

## 1. Initial Application Request

### User Prompt
> 1. Build a Singapore-based exchange rate tool that provides real-time currency conversions for the SG currencies.
> 2. Build just the front end for now. I will add the backend integration using MAS API keys later. Use a clean UI with search, favorites, and a simple calculator.

### Solution & Summary
- **App Name**: SingaRate - Singapore Currency Exchange & Conversion Desk
- **Features**:
  - Two-way interactive currency calculator (SGD ⇄ Foreign currencies) with quick amount presets ($100, $500, $1,000, $2,500, $5,000) and copy-to-clipboard.
  - Singapore retail spread simulator comparing:
    - Wholesale Mid-Market (MAS Reference)
    - Digital Multi-Currency Cards (YouTrip / Wise: ~0.25% spread)
    - Money Changers (The Arcade at Raffles Place / Mustafa: ~0.65% spread)
    - Retail Bank & Credit Cards (DBS, OCBC, UOB: ~2.75% fee)
  - Travel cash denomination guides (e.g., breakdown of RM50/RM100 notes for MYR, ¥1,000/¥10,000 notes for JPY).
  - Search filter supporting ISO currency codes, currency names, and country names.
  - Watchlist & Favorites system persisted in `localStorage`.
  - Grid and High-Density Table views with sorting (popularity, code, 24h change, rate).
  - Rate Detail modal featuring interactive 7-day SVG trajectory charts and 24h high/low range meters.
  - MAS official quotation convention support (official 100-unit quotations for JPY, MYR, IDR, THB, KRW, TWD, PHP, VND).

---

## 2. Git Repository & Initial Push

### User Prompt
> Git push https://<GITHUB_PAT>@https://github.com/tokyobuddy76/mas-exchanger.git

### Solution & Summary
- Initialized local git repository, configured git user details, and created branch `main`.
- Added all project files with `.gitignore` filtering out sensitive files and `node_modules`.
- Pushed commit `f51674e` to `https://github.com/tokyobuddy76/mas-exchanger.git`.
- Included security advisory recommending token rotation.

---

## 3. Serverless MAS API Integration

### User Prompt
> 1. Add a serverless API connection that pulls live data from MAS API catalogue using the following endpoint:
>    `GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14`
>    `# KeyId: <MAS_KEY_ID>`
> 2. Store this in `/api` folder at the project root level not the `src` folder.
> 3. Include a `/health.ts` and `/exchangerates.ts` within the same subfolder.
> 4. Do not hardcode any API key, I will manually include them.

### Solution & Summary
- Created `/api/health.ts`:
  - Returns service status, UTC timestamp, uptime, and boolean flag indicating whether `MAS_KEY_ID` is defined.
- Created `/api/exchangerates.ts`:
  - Queries `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily`.
  - Sends header `KeyId: <MAS_KEY_ID>`.
  - Dynamically extracts `MAS_KEY_ID` from `process.env.MAS_KEY_ID` or request headers (zero hardcoded secrets).
  - Supports `end_of_day` and `limit` query parameters.
  - Gracefully returns a structured `config_required` response when `MAS_KEY_ID` is omitted.
- Created `/server.ts` & updated `package.json` with `"dev": "tsx server.ts"` for unified full-stack development and serverless compatibility.
- Added `MAS_KEY_ID` documentation to `.env.example`.
- Verified endpoints via `curl -s http://localhost:3000/api/health` and `curl -s http://localhost:3000/api/exchangerates`.
- Committed and pushed changes to GitHub repo (commit `1b0211b`).

---

## 4. Export Chat Log

### User Prompt
> Export this chat as a .md file as PROMPTS.md

### Action Taken
- Created `PROMPTS.md` containing the structured record of all user prompts, design architecture, implementation details, and API schemas.
