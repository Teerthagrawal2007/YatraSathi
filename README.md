# YatraSathi (यात्रासाथी) 🇮🇳

> **Your AI-Powered Travel Management, ₹ INR Budgeting & Booking Companion for India**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTeerthagrawal2007%2FYatraSathi&env=GEMINI_API_KEY,DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&envDescription=API%20Keys%20and%20Configuration&project-name=yatrasathi&repository-name=yatrasathi)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Teerthagrawal2007%2FYatraSathi-blue?logo=github)](https://github.com/Teerthagrawal2007/YatraSathi)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Deployment-black?logo=vercel)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTeerthagrawal2007%2FYatraSathi)

🌐 **Live Vercel Deployment**: [https://yatrasathi.vercel.app](https://yatrasathi.vercel.app) *(or your deployed Vercel domain)*

YatraSathi is a full-stack, mobile-friendly Indian travel web application powered by **Google Gemini AI**, **Next.js 16 (App Router & Turbopack)**, **React 19**, **Prisma ORM**, and **Tailwind CSS**. It is designed specifically for the Indian travel ecosystem with realistic seasonal costs in ₹ INR, IRCTC trains (Vande Bharat, Rajdhani, Shatabdi), heritage havelis, emergency helplines, and compliance with India's **Digital Personal Data Protection (DPDP) Act 2023**.

---

## ✨ Key Features

### 1. 🤖 Gemini AI Dynamic Itinerary Planner
- Generates comprehensive day-by-day itineraries (Morning, Afternoon, Evening) for any Indian destination.
- Tailored by duration (1–14 days), travel style (Backpacker, Balanced, Luxury, Trekker, Family), and total budget in ₹ INR.
- Curates regional cuisine recommendations (e.g. *Dal Baati Churma in Jaipur*, *Appam & Stew in Kerala*, *Banarasi Kachori in Varanasi*).
- Provides packing checklists, local safety guidelines, nearest civil hospitals, and tourist police contacts.
- One-click **"Save as Active Trip"** persists the plan directly into your SQLite database.

### 2. 🎫 AI Booking Engine & Digital E-Ticket Generator
- **AI Natural Language Search**: Query real Indian transit and stays (e.g., *"Morning Vande Bharat from Delhi to Jaipur"*, *"Lakeview haveli in Udaipur under ₹4,000"*).
- **Official Digital Vouchers**: Gemini automatically allocates Coach & Seat numbers (e.g., `Coach C2, Seat 45 (Window)`), generates a valid PNR / Reference ID, check-in instructions, and customized travel tips.
- **Budget Auto-Sync**: Reservations automatically create linked expenses under your active trip, updating your spending envelope in real time.
- **Printable E-Tickets**: Print or save your booking pass directly from the app.

### 3. 💰 Smart ₹ INR Budget Manager & Companion Splitter
- Tracks travel spending across 6 categories: `Food & Dining`, `Stays & Hotels`, `Trains & Transit`, `Bazaars & Shopping`, `Activities`, and `Miscellaneous`.
- Visual progress gauges showing percentage spent and over-budget warnings.
- **Companion Expense Splitting**: Log who paid and compute equal shares among companions with instant per-person breakdowns.

### 4. 🛡️ Safety Center & One-Touch Emergency SOS
- **Emergency SOS Simulation**: Broadcasts simulated high-priority SMS alerts with GPS coordinates to registered safety contacts.
- **1-Click National Helplines**: Direct click-to-call links for India's emergency services:
  - `112`: National Emergency Services (Police, Fire, Medical)
  - `1363`: 24x7 Ministry of Tourism Multi-Language Helpline
  - `1091`: National Women Helpline
  - `102`: Medical Ambulance
  - `139`: RailMadad (Indian Railways Passenger Assistance)
- **DPDP Act 2023 Location Consent**: Opt-in location pinging with zero third-party data tracking.

### 5. 🌐 Bilingual & Theming
- **Bilingual Interface**: Seamlessly switch between **English** and **हिंदी (Hindi)**.
- **Light & Dark Theme**: Warm parchment saffron aesthetic or dark OLED mode.

### 6. 📱 Mobile-First Native Experience
- Mobile-optimized layout with a native-style **Bottom Navigation Bar** for smartphones.
- **QR Code Sharing**: Click "Mobile Link" to scan a QR code and open the app on your phone over Wi-Fi (`http://192.168.1.28:3000`).
- **Remote Mobile Tunneling**: Built-in support for `npm run tunnel` to access the app over 4G/5G mobile data anywhere.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.4.3 (App Router & Turbopack)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **AI Brain**: Google Gemini API (`gemini-3.5-flash`, `gemini-flash-lite-latest`, `gemini-3-flash-preview`) with structured JSON schema enforcement
- **Database**: Prisma ORM 5 with SQLite (`prisma/dev.db` portable to PostgreSQL)
- **Authentication**: NextAuth.js
- **Compliance**: India DPDP Act 2023 (Explicit Consent & Right to Erasure)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ installed
- Git installed

### 2. Installation
```bash
git clone https://github.com/Teerthagrawal2007/YatraSathi.git
cd YatraSathi
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and insert your Gemini API Key:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_gemini_api_key_here"
NEXTAUTH_SECRET="yatrasathi_super_secret_jwt_key_2026_dev"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
Initialize the database and apply the Prisma schema:
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Testing on Mobile

- **Same Wi-Fi**: Open `http://<your-computer-ip>:3000` (e.g. `http://192.168.1.28:3000`) on your mobile browser, or click **Mobile Link** in the navbar to scan the QR code.
- **Public Mobile Link (Anywhere)**:
  ```bash
  npm run tunnel
  ```

---

## 📜 License
This project is open-source under the MIT License.
