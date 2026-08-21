# FlyRank Capstone: Embeddable Widget Platform

Let a customer define a widget, hand them one line of `<script>`, and safely catch everything the public internet throws back at you — validated, spam-filtered, enriched, and dashboarded.

## 🚀 What the System Does
This is a comprehensive platform for managing, delivering, and processing embeddable widgets (like signup forms, contact forms, or call-to-action popovers). 
It securely accepts cross-origin submissions from any website on the internet, defends against abuse (rate-limiting, honeypots), gracefully enriches incoming data (IP geolocation with failovers), and provides an authenticated dashboard for widget owners to view their leads.

## 🏗️ Architecture

```text
Widget Owner (authenticated)
 └─► Widget Management API ─► Widget DB (tenant-isolated) ─► embed snippet

Customer Website (any origin)
 └─ <script src="widget.js?id=123">
      └─► GET /widgets/:id/config    (public · cached · CORS)
           └─► render widget

Website Visitor
 └─► POST /submissions               (public · CORS)
      ├─► validation ─────────────── bad payload? → 4xx, never 500
      ├─► rate limit + spam check ── flood? → 429, service stays up
      ├─► geo enrichment: Provider A ─(fails)─► Provider B ─(fails)─► store anyway
      ├─► store submission
      └─► email / webhook side effect (failure must NOT block success)
```

## 🛠️ Setup & Run

### Prerequisites
- Node.js (v18+) or Python (3.10+)
- Docker (for PostgreSQL)

### Running the Application

1. **Start the database:**
   ```bash
   docker compose up -d
   ```

2. **Configure Environment:**
   Copy the example environment variables and fill in your details:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies & Run:**
   *If using Node.js:*
   ```bash
   npm install
   npm run dev
   ```
   *If using Python:*
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

### 🌰 Seed Demo Data
To populate the database with a test user and an initial widget, run:
```bash
# Example seeder command (adjust based on your framework)
npm run seed  # OR python seed.py
```

## 🧪 Testing
Run the automated test suite covering CORS, rate limiting, and fallback enrichment:
```bash
npm run test  # OR pytest
```

## ⚠️ Limitations & Honest Notes
- **Hosting & CDN:** This project is built to demonstrate production concepts (like CORS, versioned bundles, cache headers) locally using a multi-origin setup. It does not currently deploy to a real CDN.
- **Mocked Dependencies:** Geo-location enrichment relies on free APIs (like ip-api.com and ipapi.co). In tests, these providers are mocked to ensure deterministic fallback behavior.
- **Widget UI:** The frontend embed script generates a minimal unstyled HTML form; the focus of this system is backend resilience and API security, not CSS perfection.
- **Email Side-effects:** Secondary effects like emails are simulated using console logs or local catchers (like Mailpit) to demonstrate safe, non-blocking asynchronous execution.
