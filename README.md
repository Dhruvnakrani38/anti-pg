# 🏠 PG Management System

A full-stack web application for managing Paying Guest (PG) accommodations.

## Tech Stack
- **Frontend**: React.js (Vite) + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt
- **Images**: Cloudinary
- **Charts**: Recharts

## Project Structure
```
pg-management/
├── client/   ← React frontend
└── server/   ← Node.js backend
```

## 🚀 Getting Started

### 1. Setup Environment Variables
Edit `server/.env` with your credentials:
- MongoDB Atlas connection string
- Cloudinary API keys
- Gmail credentials (for OTP)

### 2. Install Dependencies (already done)
```bash
cd server && npm install
cd client && npm install
```

### 3. Seed Database (after configuring MongoDB URI)
```bash
cd server && node seed.js
```
Creates:
- Admin: `admin@pgmanage.com` / `Admin@123`
- Demo Owner: `owner@pgmanage.com` / `Owner@123`

### 4. Start Development
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open: http://localhost:5173

## 📱 Three Panels
| Panel | URL | Access |
|---|---|---|
| Public | / | Everyone |
| Owner | /owner | After owner login |
| Admin | /admin | After admin login |
