# Paisa Pulse 💸

Modern, intelligent personal finance and expense tracker built with clean analytics, customized budget tracking, recurring bills management, and smart bank/UPI SMS parsing.

---

## ✨ Features

* **Status Window Dashboard:** Real-time net worth and available balance overview, 14-day spending velocity chart, summary KPI cards, and Mochi companion insights.
* **Transaction Ledger:** Complete record of income and expenses with advanced search, category filtering, sorting, and manual or SMS entry.
* **Bank & UPI SMS Parser:** Automatically decodes and extracts amounts, merchants, and categories from Indian bank and UPI SMS alerts (HDFC, SBI, ICICI, Axis, Paytm, PhonePe, Google Pay).
* **Monthly Budgets & Mana Runes:** Set overall monthly spending caps and category-specific allowances with live progress bars and breach warnings.
* **Savings Goals & Bounties:** Track milestones for future purchases, trips, and emergency reserves with contribution history.
* **Recurring Bills & Pacts:** Monitor subscriptions, rent, and utility commitments with normalized monthly run-rate calculations and one-click execution.
* **Cloud Sync & Self-Directed Privacy:** Secure Google OAuth 2.0 authentication backed by Cloud Firestore with end-to-end user data isolation.
* **Excel & CSV Export:** Download your complete transaction ledger formatted with UTF-8 BOM encoding for spreadsheets and offline backups.
* **Adaptive Theme:** Clean Light mode, obsidian Dark mode with high contrast, and automatic system preference matching.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router, Static Export compatible)
* **UI & Styling:** React 18, TypeScript, Tailwind CSS
* **Authentication & Database:** Firebase Auth (Google Provider), Cloud Firestore
* **Audio Synthesis:** Native Web Audio API (procedural retro & cyberpunk sound effects without external audio assets)

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js** (v18+ recommended)
* A modern web browser

### 1. Clone the Repository
```bash
git clone [https://github.com/Mayur-Bandekar01/expense-tracker.git](https://github.com/Mayur-Bandekar01/expense-tracker.git)
cd expense-tracker
```

### 2. Install Dependencies
```Bash
npm install
```

### 3. Configure Environment Variables
 Create a .env.local file in the root directory and add your Firebase configuration credentials:
```Code snippet
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Development Server
```Bash
npm run dev
```
