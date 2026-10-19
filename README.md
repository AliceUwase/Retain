# Retain

Retain is a personal expense tracker. A user can log what they spend, set a monthly budget, and see where their money went: by week, by category, and against the budget.

| | |
| --- | --- |
| **Live app** | https://retain-umber.vercel.app |
| **API** | https://retain-api-bdg7.onrender.com |

**Demo accounts**

| Role | Email | Password |
| --- | --- | --- |
| User | `demo@retain.app` | `Retain4User!` |
| Admin | `admin@retain.app` | `Retain4Admin!` |

> The API runs on Render's free plan and sleeps when idle, so the first request can take up to a minute.


## Features

### As a user

- See a monthly overview: total spent compared with last month, remaining budget, spending by week, and top categories.
- Add, edit and delete expenses, each with a title, amount, date, category, payment method and optional notes.
- Search expenses and filter them by category, payment method and date range, then sort by date or amount.
- Open any expense to see its details, and other expenses from the same category that month.
- Set a budget for any month and see whether you're within, close to, or over it.
- Export the filtered expenses to a CSV file.

### As an admin

- See an overview of the whole app: users, expenses, total spending, spending per category, the most and least used categories, and recent activity.
- Add, rename and delete categories; a deleted category's expenses move to "Uncategorized" so none are lost.

## Tech stack

| Part | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Material UI, MUI X Charts and Date Pickers, Day.js |
| State | **React Context** for login and roles (`AuthContext`); **Redux Toolkit** for search, filters, sorting and pagination (`filtersSlice`) |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB Atlas with Mongoose |
| Auth & security | JWT, bcrypt password hashing, zod validation, helmet, CORS, rate limiting on login and sign-up |
| Hosting | Vercel (frontend), Render (API) |

## Project structure

```
Retain/
├── retain-web-app/   React frontend (deployed on Vercel)
└── retain-api/       Express API (deployed on Render)
    └── src/
        ├── routes/       URLs and the checks each one runs
        ├── controllers/  what each endpoint does
        ├── models/       Mongoose schemas: User, Category, Expense, Budget
        ├── middleware/   auth, validation, rate limits, error handling
        ├── schemas/      zod request rules
        └── seed/         demo data
```

## Running it locally

You need Node.js 22 and a MongoDB connection string (a free [Atlas](https://www.mongodb.com/atlas) cluster works).

**1. API**

```bash
cd retain-api
npm install
cp .env.example .env     # then fill in the values (see below)
npm run seed             # demo users, categories, expenses and budgets
npm run dev              # http://localhost:4000
```

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Your connection string, with the database name (e.g. `/retain`) |
| `JWT_SECRET` | A random string of at least 32 characters |
| `CLIENT_URL` | `http://localhost:5173` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | The admin login the seed creates |
| `SEED_DEMO_EMAIL` / `SEED_DEMO_PASSWORD` | The demo user login the seed creates |

**2. Frontend** (in a second terminal)

```bash
cd retain-web-app
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:4000
npm run dev                  # http://localhost:5173
```

## API

All endpoints are under `/api`. Requests and responses are JSON.

**Authentication:** log in to get a token, then send it with every request:

```
Authorization: Bearer <token>
```

**Errors** always look like `{ "error": "message" }`, with the status code: `400` invalid input, `401` not logged in or token expired, `403` wrong role, `404` not found (including other users' data), `409` already exists, `429` too many attempts.

Users can only see and change their own expenses and budgets. The admin account manages the app and can't use the personal endpoints.

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create a user account, returns `{ user, token }` |
| POST | `/auth/login` | Public | Body `{ email, password, remember }`, returns `{ user, token }` |
| GET | `/auth/me` | Logged in | The user the token belongs to |

### Expenses

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/expenses` | User | Your expenses, filtered and paginated |
| POST | `/expenses` | User | Add an expense |
| GET | `/expenses/:id` | User | One of your expenses |
| PATCH | `/expenses/:id` | User | Edit one of your expenses |
| DELETE | `/expenses/:id` | User | Delete one of your expenses |

**Filtering:** `GET /api/expenses` takes these optional query parameters:

| Parameter | Example | Notes |
| --- | --- | --- |
| `search` | `rent` | Matches the title or notes, any case |
| `category` | category id | |
| `paymentMethod` | `Cash` | `Cash`, `Card`, `Mobile Money` or `Bank Transfer` |
| `startDate`, `endDate` | `2026-10-01` | Inclusive date range |
| `sortBy`, `sortOrder` | `amount`, `asc` | Defaults: `date`, `desc` |
| `page`, `limit` | `2`, `10` | Defaults: `1`, `10` (max `500`) |

Response:

```json
{
  "items": [{ "id": "...", "title": "Groceries", "amount": 62.5, "categoryId": "...", "date": "2026-10-17", "paymentMethod": "Card", "notes": "", "createdAt": "...", "updatedAt": "..." }],
  "total": 27,
  "totalAmount": 2295.69,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

**Adding an expense:**

```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "Lunch", "amount": 9.5, "categoryId": "<id>", "date": "2026-10-19", "paymentMethod": "Cash", "notes": "" }
```

Returns `201` with the saved expense. The owner always comes from the token.

### Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/categories` | Logged in | All categories |
| POST | `/categories` | Admin | Add a category: `{ name }` |
| PATCH | `/categories/:id` | Admin | Rename a category: `{ name }` |
| DELETE | `/categories/:id` | Admin | Delete a category; returns `{ movedExpenses }` |

### Budgets

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/budgets` | User | All your monthly budgets |
| GET | `/budgets/:month` | User | One month's budget, e.g. `/budgets/2026-10` |
| PUT | `/budgets/:month` | User | Set or replace a month's budget: `{ amount }` |

### Dashboard

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/dashboard?month=2026-10` | User | Totals, budget status, weekly and per-category spending, recent expenses |

### Admin

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/admin/overview` | Admin | Counts and totals across all users, category rankings, recent activity |
| GET | `/admin/users` | Admin | All accounts |
| GET | `/admin/categories` | Admin | Each category with how many expenses use it |

### Health

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | API and database status |
