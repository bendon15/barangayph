# Barangay PH — Resident Portal

A modern, full-stack Philippine barangay website: a public information site plus
a resident portal for requesting certificates/clearances/reports online, and an
admin console for managing everything behind the scenes.

Built with **HTML, CSS, JavaScript, PHP, and MySQL** — no frameworks, no build
step. Every page is a plain `.html` file; every API endpoint is a plain `.php`
file. `Barangay PH` is a fictional barangay created for this portfolio
project — it is **not an official government website**.

---

## ✨ Features

**Public site**
- Barangay profile, mission/vision, seal, and quick stats
- Full officials directory — Punong Barangay, Kagawads, SK Chairperson & Kagawads,
  Secretary, Treasurer, and Tanods
- Homepage feed of announcements and ongoing programs
- Services catalog describing all 7 request types and fees

**Resident portal** (account required)
- Registration & login
- Submit requests for:
  1. Barangay Clearance
  2. Barangay Residency Certificate
  3. Barangay Indigency Certificate
  4. Barangay Business Clearance
  5. Blotter Report
  6. Complaint
  7. Pet Registration / Vaccination
- Track request status (Pending → Processing → Ready for Pickup → Released)
- View profile information on file

**Admin console**
- Dashboard overview with live stats
- Manage service requests: filter, search, view details, update status, add notes
- View registered residents
- Create/edit/delete announcements & programs
- Create/edit/delete officials

---

## 🧠 How this runs in two modes (important)

This project is meant to be **usable immediately as a static portfolio demo**,
and **upgradeable to a real database-backed app** without rewriting any pages.

`public/assets/js/api-client.js` is the single place every page talks to "the
backend" through. On load, it pings `/api/health.php`:

- **If a PHP server responds** (Laragon, XAMPP, Hostinger, any Apache/Nginx +
  PHP host) → every request goes to the real `api/*.php` endpoints, which read
  and write MySQL via `database/schema.sql`.
- **If it doesn't** (e.g. this repo deployed as a static site to Vercel or
  GitHub Pages, where PHP cannot execute) → it transparently falls back to
  `public/assets/js/demo-data.js`, a `localStorage`-backed dataset with the
  same shape as the real API responses. The whole portal — login, requests,
  admin CRUD — works instantly, per-browser, with no server at all.

You never edit `dashboard.js`, `admin-requests.js`, etc. when switching modes —
only your hosting choice changes which backend `api-client.js` finds.

---

## 📁 Project structure

```
barangay-ph/
├── public/                     ← deploy this folder as the site (static or PHP host)
│   ├── index.html               Homepage
│   ├── officials.html           Officials directory
│   ├── services.html            Services catalog
│   ├── announcements.html       Full announcements list
│   ├── login.html               Resident + Admin login (tabbed)
│   ├── register.html            Resident registration
│   ├── dashboard.html           Resident dashboard (single-page: overview,
│   │                            submit request, my requests, profile)
│   ├── admin/
│   │   ├── index.html           Admin overview
│   │   ├── requests.html        Manage service requests
│   │   ├── residents.html       View residents
│   │   ├── announcements.html   Manage announcements (CRUD)
│   │   └── officials.html       Manage officials (CRUD)
│   └── assets/
│       ├── css/                 base.css (design tokens), site.css, dashboard.css
│       └── js/
│           ├── demo-data.js      Seed data + localStorage demo "database"
│           ├── api-client.js     Dual-mode API layer (real PHP ⇄ demo fallback)
│           ├── components.js     Shared header/footer/seal
│           ├── dash-components.js Shared sidebar/topbar for dashboards
│           ├── site-render.js    Shared render functions (services/officials/announcements)
│           ├── utils.js          Formatting & auth-guard helpers
│           ├── home.js / dashboard.js / admin-requests.js  Page-specific logic
│
├── api/                         ← PHP backend (used once deployed to a PHP host)
│   ├── config/db.php             PDO/MySQL connection
│   ├── includes/bootstrap.php    Session, CORS, JSON helpers, auth guards
│   ├── health.php                Backend-detection endpoint
│   ├── barangay-info.php
│   ├── officials/  {list,save,delete}.php
│   ├── announcements/ {list,save,delete}.php
│   ├── auth/ {register,login,admin_login,logout,me}.php
│   ├── requests/ {submit,mine,list,update_status}.php
│   └── residents/ {list,me}.php
│
├── database/
│   └── schema.sql               Full schema + sample/demo data
│
├── vercel.json                  Serves /public as the site root on Vercel
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Option A — Instant demo (no server, no database)

Because of the dual-mode design above, you can preview the whole app with
nothing but a static file server:

```bash
cd public
python3 -m http.server 8080
# open http://localhost:8080
```

Or deploy `public/` straight to **GitHub Pages** or **Vercel** (see below) —
it works with zero configuration. All data lives in the browser's
`localStorage`, reseeded automatically on first visit.

**Demo accounts** (also shown on the login page):

| Role     | Username / Email     | Password     |
|----------|-----------------------|--------------|
| Resident | `resident@demo.ph`    | `resident123`|
| Admin    | `admin`                | `admin123`  |
| Staff    | `staff`                | `staff123`  |

> Demo data resets if you clear your browser's site data — that's expected.

### Deploying the demo to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** your repo.
3. Framework preset: **Other**. Vercel will read `vercel.json`, which sets
   `outputDirectory` to `public` — no build command needed.
4. Deploy. You'll get a live static demo URL.

*(Vercel does not execute PHP, so `/api` is inert there — that's fine, that's
exactly what the demo fallback in `api-client.js` is for.)*

### Deploying the demo to GitHub Pages

Repo Settings → Pages → Deploy from a branch → set the folder to `/public`
(or copy `public/`'s contents to the repo root / a `gh-pages` branch).

---

## 🛠️ Option B — Full stack with real PHP + MySQL

This is the "later connect to a real database/server" path.

### 1. Local development (Laragon or XAMPP)

1. Place the whole project folder inside your server root, e.g.
   `C:\laragon\www\barangay-ph`.
2. Start MySQL, then open phpMyAdmin (or the `mysql` CLI) and:
   - Create a database named `barangay_portal`
   - Import `database/schema.sql`
3. Confirm `api/config/db.php` matches your local MySQL credentials (Laragon's
   defaults — host `127.0.0.1`, user `root`, empty password — already match
   the file's fallback values, so most setups need no changes).
4. Point the web root at the `public/` folder (in Laragon, use a virtual host
   pointing to `public/`, or simply browse to
   `http://localhost/barangay-ph/public/`).
5. Open the site — `api-client.js` will detect the live `api/health.php` and
   switch out of demo mode automatically. Register a fresh resident account or
   log in with the seeded demo accounts above (now backed by real MySQL rows).

### 2. Production deployment (Hostinger or any shared PHP host)

1. Create a MySQL database from your hosting control panel and import
   `database/schema.sql` via phpMyAdmin.
2. Upload the project. Point the domain's **document root** at the `public/`
   folder specifically — `api/` and `database/` should sit one level above
   the web root if your host allows it (recommended), or alongside `public/`
   if not (the `.htaccess`-less structure here works either way since nothing
   outside `public/` is served by static file requests).
3. Set environment variables for the database if your host supports it
   (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`) — otherwise edit the fallback
   values directly in `api/config/db.php` before uploading.
4. Visit your domain. The frontend will detect the live backend and start
   reading/writing real data immediately — no other code changes required.

### 3. Environment variables reference

| Variable          | Used by              | Default (local) |
|-------------------|-----------------------|------------------|
| `DB_HOST`         | `api/config/db.php`   | `127.0.0.1`      |
| `DB_PORT`         | `api/config/db.php`   | `3306`           |
| `DB_NAME`         | `api/config/db.php`   | `barangay_portal`|
| `DB_USER`         | `api/config/db.php`   | `root`           |
| `DB_PASS`         | `api/config/db.php`   | *(empty)*        |
| `FRONTEND_ORIGIN` | `api/includes/bootstrap.php` | *(unset — same-origin only)* |

---

## 🗄️ Database schema overview

| Table               | Purpose |
|---------------------|---------|
| `barangay_info`      | Singleton row with barangay profile, mission/vision, stats |
| `officials`          | All officials, one row each, tagged by `position` enum |
| `announcements`      | Homepage announcements/programs, categorized & pinnable |
| `residents`          | Resident accounts (bcrypt-hashed passwords) |
| `admins`             | Admin/staff accounts, `role` = `super_admin` or `staff` |
| `service_requests`   | All 7 request types in one table; type-specific fields live in a `details` JSON column, keeping the schema lean |
| `pets`               | Dedicated pet registry (auto-computes next vaccination due date) linked back to its originating request |

See inline comments in `database/schema.sql` for column-level detail.

---

## 🎨 Design notes

The visual identity intentionally avoids generic template styling: a
civic navy (`#0B2545`) paired with a single sun-gold accent (`#E8A93B`) —
drawn from the Philippine flag's blue field and eight-ray sun — a serif
display face for headings/seal (`Source Serif 4`) against a clean sans body
face (`Inter`), and a cool paper-white ground rather than a warm "AI-default"
cream. All design tokens live at the top of `public/assets/css/base.css`.

---

## 📌 Notes for reviewers / portfolio visitors

- This is a demo project. "Barangay PH" and everyone in its officials
  directory are fictional.
- No real personal data is collected; the resident registration form is for
  demonstration only.
- The codebase is intentionally framework-free to keep the HTML/CSS/JS/PHP/SQL
  stack transparent and easy to read end-to-end.
