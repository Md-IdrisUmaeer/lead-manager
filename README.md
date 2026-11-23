# Lead Manager

A small full-stack web app for a sales user to capture and track leads: add, view, edit, delete, search and filter leads, with a live count of leads per status.

**Live demo:** [https://YOUR-APP.vercel.app](https://lead-manager-phi-five.vercel.app/)
**API:** [https://YOUR-API.onrender.com/api/health](https://lead-manager-api-152k.onrender.com/api/health)

> The backend runs on Render's free tier, which sleeps after 15 minutes without traffic. The first request after that can take about 50 seconds. If the page shows "Can't reach the server", wait a moment and click **Retry**.

---

## Features

- **Add a lead** with name, email, phone, company, source (dropdown) and status (New / Contacted / Qualified / Lost)
- **Leads table** with a colour-coded status badge on every row
- **Edit** any lead, including its status
- **Delete** with a confirmation dialog
- **Search** by name (debounced) and **filter** by status, together
- **Sorting** by name, company, status or created date (click a column header)
- **Pagination**, 10 leads per page
- **Dashboard counts:** total leads and leads per status, updated after every change
- **Validation on both ends** with the same rules and messages: required fields, email and phone format, length limits, duplicate email
- **Graceful errors:** loading, empty and error states, field-level error messages from the server, and a retry screen when the API is down or unreachable
- **Responsive layout** down to mobile width

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 (Vite), plain CSS, `fetch` |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

**Why this stack:** MERN is the stack I'm most productive in, and it matches the company stack (React + Node/Express, MongoDB listed as an option). The data is a single, self-contained entity with a fixed shape, which MongoDB with a Mongoose schema handles cleanly: the schema enforces required fields, enums and formats, and indexes cover the filter and sort queries.

Express 5 was chosen over Express 4 because it forwards errors from `async` route handlers to the error middleware automatically. Controllers have no `try/catch` blocks; they throw, and one central handler turns every error into the same response shape.

---

## Project structure

```
lead-manager/
├── backend/
│   ├── server.js                    # loads env, connects to DB, starts server
│   ├── scripts/seed.js              # inserts 30 sample leads
│   └── src/
│       ├── app.js                   # Express app, CORS, routes, error handling
│       ├── config/db.js
│       ├── constants/lead.constants.js
│       ├── models/Lead.js           # schema, validation rules, indexes
│       ├── routes/lead.routes.js
│       ├── controllers/lead.controller.js
│       ├── services/lead.service.js # list query building, stats aggregation
│       ├── middleware/
│       │   ├── validate.middleware.js   # id check, field whitelist, query parsing
│       │   └── error.middleware.js      # 404 + central error handler
│       └── utils/                   # AppError, escapeRegex
└── frontend/
    └── src/
        ├── api/                     # fetch wrapper (ApiError), lead API calls
        ├── hooks/                   # useLeads, useStats, useDebounce
        ├── components/common/       # Button, TextField, Modal, Toast, ...
        ├── components/leads/        # LeadsTable, LeadForm, FilterBar, StatsBar, ...
        ├── pages/LeadsPage.jsx
        ├── utils/validateLead.js    # mirrors the backend schema rules
        └── constants/lead.js
```

---

## Running locally

**Requirements:** Node.js 20+ and MongoDB (local install or an Atlas connection string).

### 1. Clone

```bash
git clone https://github.com/Md-IdrisUmaeer/lead-manager.git
cd lead-manager
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run seed              # optional: 30 sample leads
npm run dev               # http://localhost:5000
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/lead-manager` |
| `CLIENT_ORIGIN` | Allowed frontend origin(s), comma-separated | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` |

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5173
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the API | `http://localhost:5000/api` |

### Scripts

| Where | Command | What it does |
|---|---|---|
| backend | `npm run dev` | Start the API with nodemon |
| backend | `npm start` | Start the API |
| backend | `npm run seed` | Replace all leads with 30 sample leads |
| frontend | `npm run dev` | Start the Vite dev server |
| frontend | `npm run build` | Production build |
| frontend | `npm run lint` | ESLint |

---

## API

Base URL: `/api/leads`. All responses are JSON.

| Method | Endpoint | Description | Success |
|---|---|---|---|
| `GET` | `/api/leads` | List leads (search, filter, sort, paginate) | `200` |
| `GET` | `/api/leads/stats` | Total and count per status | `200` |
| `GET` | `/api/leads/:id` | Get one lead | `200` |
| `POST` | `/api/leads` | Create a lead | `201` |
| `PATCH` | `/api/leads/:id` | Update any fields of a lead | `200` |
| `DELETE` | `/api/leads/:id` | Delete a lead | `204` |
| `GET` | `/api/health` | Health check | `200` |

**List query parameters**

| Param | Default | Values |
|---|---|---|
| `search` | none | Case-insensitive match on name |
| `status` | none | `New`, `Contacted`, `Qualified`, `Lost` |
| `sort` | `createdAt` | `name`, `company`, `status`, `createdAt`, `updatedAt` |
| `order` | `desc` | `asc`, `desc` |
| `page` | `1` | integer ≥ 1 |
| `limit` | `10` | 1–50 |

Example: `GET /api/leads?search=priya&status=New&sort=name&order=asc&page=1`

**Response shapes**

```json
// GET /api/leads
{
  "data": [
    {
      "id": "6740f1c2a9e4b1d2c3f4a5b6",
      "name": "Priya Iyer",
      "email": "priya@example.com",
      "phone": "+91 98765 43210",
      "company": "Acme Corp",
      "source": "Referral",
      "status": "New",
      "createdAt": "2026-11-22T10:30:00.000Z",
      "updatedAt": "2026-11-22T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 30, "totalPages": 3 }
}

// GET /api/leads/stats
{ "data": { "total": 30, "byStatus": { "New": 7, "Contacted": 7, "Qualified": 8, "Lost": 8 } } }
```

**Errors** always have the same shape:

```json
{ "error": "Validation failed", "details": { "email": "Enter a valid email" } }
```

| Status | When |
|---|---|
| `400` | Invalid body, query parameter or id; schema validation failed |
| `404` | Lead or route not found |
| `409` | A lead with that email already exists |
| `500` | Unexpected error (generic message; details are logged on the server only) |

---

## Database design

One collection, `leads`:

| Field | Type | Rules |
|---|---|---|
| `name` | String | required, 2–100 characters |
| `email` | String | required, valid format, lowercase, **unique** |
| `phone` | String | optional, digits / spaces / `+ - ( )`, 7–20 characters |
| `company` | String | optional, max 100 characters |
| `source` | String | required, one of Website, Referral, LinkedIn, Cold Call, Event, Other |
| `status` | String | one of New, Contacted, Qualified, Lost; defaults to New |
| `createdAt`, `updatedAt` | Date | automatic |

**Indexes**

| Index | Purpose |
|---|---|
| `{ email: 1 }` unique | Prevents duplicate leads |
| `{ status: 1, createdAt: -1 }` | Status filter combined with the default newest-first sort |
| `{ createdAt: -1 }` | Default listing without filters |

Phone is stored as a string so leading zeros and `+` country codes are kept.

---

## Design decisions

- **One source of validation rules.** Field rules (required, formats, enums, lengths) live in the Mongoose schema. Middleware only checks the request's shape: valid id, only known fields (anything else such as `_id` or `$set` is dropped), string types, and valid query parameters. The frontend's `validateLead` mirrors the schema with the same messages, so users get instant feedback, and server errors map onto the same form fields.
- **Safe search.** User input is regex-escaped before it is used in the name search, so input like `a(` or `.*` is matched literally instead of breaking the query or matching everything.
- **Stable pagination.** Every sort adds `_id` as a tie-breaker, so leads with equal sort values never repeat or disappear between pages.
- **No stale results.** Each list request aborts the previous one, so a slow response for an old search can't overwrite newer results.
- **One error shape end to end.** The backend always returns `{ error, details? }`; the frontend's API client turns every failure (HTTP error, network failure, timeout) into one `ApiError`, which the UI shows as a field error, a toast or a retry screen.

---

## Assumptions

- The app is used by a single sales user; there is no login, so all leads are visible to whoever opens the app.
- Email identifies a lead, so two leads can't share an email address.
- Name, email and source are required. Phone and company are optional, since they're often unknown when a lead is first captured.
- New leads start with the status **New** unless another status is chosen.
- Search matches on name only, as specified in the brief.

---

## What I would improve with more time

- **Authentication** (signup / login with JWT) so each user sees only their own leads. Leads would reference a `User` via a `userId` field, with indexes changed to `{ userId, status, createdAt }` and email uniqueness scoped per user.
- **Automated API tests** with Jest, Supertest and an in-memory MongoDB, covering validation, filters, pagination and error cases.
- **Faster search at scale** with a text index or Atlas Search, since a case-insensitive regex can't use an index efficiently on a large collection.
- **Notes and activity history** per lead (calls, emails, status changes with timestamps).
- **Bulk actions and CSV import / export.**
- **Shared validation package** so the frontend and backend import the same rules instead of keeping a matching copy.
