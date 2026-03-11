# 🗺️ PG Management — Development Roadmap & Approach Guide

> **Philosophy**: Build thin vertical slices. Each phase = a working feature end-to-end (DB → API → UI).

---

## ✅ The Right Order to Build (Why It Matters)

Most vibe-coding projects fail because they:
1. Build UI first without connecting to real data
2. Skip auth, then bolt it on later (breaks everything)
3. Build all 3 panels at once and nothing works
4. Hardcode data instead of building real APIs

**The correct approach**:
```
Setup → Auth → Backend Model → API Route → Frontend Page → Test → Next Feature
```

Never move to the next feature until the current one works end-to-end.

---

## Phase 0 — Project Setup (Day 1)

### Goal: Both frontend and backend run and connect.

**Tasks:**
- [ ] Create GitHub repo `pg-management`
- [ ] Create `client/` using Vite + React + Tailwind
- [ ] Create `server/` with Express + Mongoose
- [ ] Set up MongoDB Atlas free cluster
- [ ] Set up `.env` files
- [ ] Test: `npm run dev` (client) and `node server.js` (server) both run
- [ ] Install all dependencies listed in architecture doc
- [ ] Set up React Router, Axios base config, AuthContext stub

**Commands:**
```bash
# Client
npm create vite@latest client -- --template react
cd client && npm install tailwindcss @tailwindcss/vite
npm install axios react-router-dom react-hook-form zod

# Server
mkdir server && cd server && npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken cors
npm install multer cloudinary nodemailer
npm install -D nodemon
```

---

## Phase 1 — Authentication (Day 2)

### Goal: Owner can register, login, get JWT. Admin is seeded.

**Backend first:**
- [ ] `User` Mongoose model (name, email, password, role)
- [ ] `POST /auth/register` — hash password, save, return JWT
- [ ] `POST /auth/login` — verify password, return JWT
- [ ] `GET /auth/me` — protected route, return user from token
- [ ] `authMiddleware.js` — JWT verify + role guard
- [ ] Seed 1 admin user in DB (script or manual)

**Frontend second:**
- [ ] `AuthContext` — stores JWT in localStorage, user object
- [ ] Login page — form → POST → store JWT → redirect
- [ ] Register page — form → POST → redirect to owner dashboard
- [ ] `ProtectedRoute` component — role-based redirect
- [ ] Test full flow: Register → Login → Verify token in /auth/me

> 🔴 **DO NOT proceed to other phases until auth works completely.**

---

## Phase 2 — Public Panel (Days 3–5)

### Goal: Home page, PG search, and PG detail page work with real data.

**Backend:**
- [ ] `PG` Mongoose model
- [ ] `GET /public/pgs` — search with query params (city, type, rent range, amenities)
- [ ] `GET /public/pgs/:id` — full PG detail
- [ ] `GET /public/cities` — list unique cities
- [ ] Seed 5-10 fake PG records directly in MongoDB for testing

**Frontend:**
- [ ] `Home.jsx` — hero + search bar + featured PGs section
- [ ] `SearchPage.jsx` — filters sidebar + PG cards grid
- [ ] `PGCard.jsx` — reusable card component
- [ ] `PGDetail.jsx` — full detail page (photos, amenities, map embed, contact)
- [ ] Navbar with "Login" and "List Your PG" links
- [ ] Footer

**Test:**
- Visit home, search for a city, click a PG, see detail page

---

## Phase 3 — Owner Panel Core (Days 6–9)

### Goal: Owner can log in, add a PG, add rooms.

**Backend:**
- [ ] `POST /owner/pgs` — add PG (protected, owner role)
- [ ] `GET /owner/pgs` — list owner's PGs
- [ ] `PUT /owner/pgs/:id` — edit PG
- [ ] Image upload: Multer → Cloudinary → save URL in PG
- [ ] `Room` model
- [ ] Room CRUD routes under `/owner/pgs/:pgId/rooms`
- [ ] `GET /owner/dashboard` — basic counts

**Frontend:**
- [ ] Owner layout with sidebar navigation
- [ ] `OwnerDashboard.jsx` — stats cards
- [ ] `MyPGs.jsx` — list of owner's PGs
- [ ] `AddPGForm.jsx` — multi-step form (basic info → amenities → photos)
- [ ] `RoomManagement.jsx` — add/edit/view rooms per PG

**Test:**
- Login as owner → Add PG → Add rooms → PG appears in public search

---

## Phase 4 — Tenant Management (Days 10–12)

### Goal: Owner can add tenants, assign to rooms, view tenant list.

**Backend:**
- [ ] `Tenant` model
- [ ] `POST /owner/tenants` — add tenant (auto-assigns room, marks room occupied)
- [ ] `GET /owner/tenants` — list with filters
- [ ] `PUT /owner/tenants/:id` — edit / checkout
- [ ] When tenant exits → room status → vacant

**Frontend:**
- [ ] `TenantList.jsx` — table with search/filter
- [ ] `AddTenantForm.jsx` — name, phone, email, room assignment, join date, rent
- [ ] `TenantProfile.jsx` — full detail + payment history

**Test:**
- Add tenant → see room status change to "Occupied" → checkout tenant → room back to "Vacant"

---

## Phase 5 — Finance Management (Days 13–15)

### Goal: Owner can track rent payments and expenses, see profit.

**Backend:**
- [ ] `Payment` model
- [ ] `Expense` model
- [ ] `POST /owner/payments` — record a payment
- [ ] `GET /owner/payments` — list (filter by tenant, month, status)
- [ ] `GET /owner/finance/summary` — total collected, pending, expenses, profit
- [ ] `POST /owner/expenses` — add expense

**Frontend:**
- [ ] `FinanceDashboard.jsx` — summary cards + charts (Recharts)
- [ ] `PaymentList.jsx` — month-wise payment table, mark as paid
- [ ] `PendingDues.jsx` — list of unpaid tenants this month
- [ ] `ExpenseTracker.jsx` — add and list expenses

**Test:**
- Add 3 tenants → generate payments for the month → mark 2 as paid → see pending dues

---

## Phase 6 — Admin Panel (Days 16–19)

### Goal: Admin can see everything and approve PGs.

**Backend:**
- [ ] `GET /admin/dashboard` — platform-wide stats
- [ ] `GET /admin/pgs` — all PGs (paginated, with owner info)
- [ ] `PUT /admin/pgs/:id/approve` — approve/reject
- [ ] `GET /admin/owners` — all owners
- [ ] `PUT /admin/owners/:id/status` — activate/deactivate
- [ ] `GET /admin/analytics` — searches, views
- [ ] `SearchLog` model — log every search query

**Frontend:**
- [ ] Admin layout with sidebar
- [ ] `AdminDashboard.jsx` — charts + stats
- [ ] `ManagePGs.jsx` — table with approve/reject actions
- [ ] `ManageOwners.jsx` — owner list + controls
- [ ] `Analytics.jsx` — search trends, top cities

**Test:**
- Owner submits PG → PG status = pending → Login as admin → Approve → PG appears in public search

---

## Phase 7 — Polish, Validation & Error Handling (Days 20–22)

### Goal: Nothing breaks. Forms validate. Errors are clear.

**Tasks:**
- [ ] Add Zod validation schemas on all forms
- [ ] Add backend input validation (express-validator or Zod)
- [ ] Add loading spinners on all async actions
- [ ] Add error toast notifications (react-hot-toast)
- [ ] Add empty states (no PGs, no tenants, etc.)
- [ ] Test all protected routes (try accessing /owner without login)
- [ ] Test all role guards (try accessing /admin as owner)
- [ ] Make sure all pages are mobile responsive
- [ ] Add 404 page

---

## Phase 8 — Enquiry System & Extras (Days 23–24)

### Goal: Public users can contact owners. Owners see enquiries.

- [ ] `Enquiry` model and routes
- [ ] Public enquiry form on PG detail page
- [ ] Owner sees enquiries in their panel
- [ ] Email notification to owner on new enquiry (Nodemailer)

---

## Phase 9 — Testing & Deployment (Days 25–27)

### Goal: App is live on the internet.

- [ ] Test all features end-to-end manually
- [ ] Fix all console errors and warnings
- [ ] Build React frontend: `npm run build`
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render.com
- [ ] Update CORS config with production URLs
- [ ] Update all .env with production values
- [ ] Final smoke test on live URL

---

## 📊 Summary Timeline

| Phase | Focus | Duration |
|---|---|---|
| 0 | Setup | 1 day |
| 1 | Authentication | 1 day |
| 2 | Public Panel | 3 days |
| 3 | Owner Panel Core | 4 days |
| 4 | Tenant Management | 3 days |
| 5 | Finance Management | 3 days |
| 6 | Admin Panel | 4 days |
| 7 | Polish & Validation | 3 days |
| 8 | Enquiry & Extras | 2 days |
| 9 | Deployment | 3 days |
| **Total** | | **~27 days** |

---

## 🚦 Golden Rules (To Avoid Vibe-Coding Errors)

1. **Build in this order every time**: Model → Route → Test API in Postman → Build React page
2. **One feature at a time**. Don't start Phase 3 until Phase 2 fully works.
3. **Use Postman to test every API route** before building the UI for it.
4. **Never hardcode data** in React. Always fetch from real API.
5. **Commit to Git after every working feature**.
6. **Use `.env` for all secrets**. Never hardcode API keys.
7. **Test auth edge cases**: expired token, wrong role, no token.
8. **Mobile-first styling**: test every page on 375px width.

---

## 🏁 Start Here (First 3 Steps Right Now)

1. **Create the GitHub repository** → `pg-management`
2. **Scaffold the project** → `client/` (Vite+React) and `server/` (Express) folders
3. **Start Phase 1 — Auth** → Build Login and Register working end-to-end before touching anything else
