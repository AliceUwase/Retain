# Retain

Retain is a personal expense tracker. A user can log what they spend, set a monthly budget, and see where their money went: by week, by category, and against the budget.

**Live app:** https://retain-umber.vercel.app/

---

## Contents

- [Feature Breakdown](#feature-breakdown)
- [Tech Stack](#how-its-built)
- [Running it locally](#running-it-locally)
- [API](#api)


## Feature Breakdown

### As a normal user

- Users can see a monthly overview: total spent compared with last month, remaining budget, spending by week, and their top categories.
- Users can add, edit and delete expenses, each with a title, amount, date, category, payment method and optional notes.
- Users can search their expenses and filter them by category, payment method and date range, then sort by date or amount.
- Users can open any expense to see its full details, and other expenses from the same category that month.
- Users can set a budget for any month and see whether they're within, close to, or over it.
- Users can export the expenses they've filtered to a CSV file that opens in Excel.

### As an admin

- The admin can see an overview of the whole app: number of users and expenses, total spending, spending per category, the most and least used categories, and recent activity.
- The admin can add, rename and delete categories; when a category is deleted, its expenses move to "Uncategorized" so none are lost.

## Tech Stack

| Technology | What it's used for |
| --- | --- |
| [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) | The UI, with typed data models in `src/types` |
| [Vite](https://vite.dev) | Dev server and production build |
| [React Router 7](https://reactrouter.com) | Pages and route guards |
| **React Context** | Login state and roles (`AuthContext`) |
| [Redux Toolkit](https://redux-toolkit.js.org) + React Redux | Search, filters, sorting and pagination (`filtersSlice`) |
| [Material UI 9](https://mui.com) | Components and a custom theme (`src/theme.ts`) |
| MUI X Charts / MUI X Date Pickers + [Day.js](https://day.js.org) | Weekly bar chart; date and month pickers |
| [Lucide](https://lucide.dev) + MUI Icons | Outline UI icons; solid category icons |
| ESLint | Linting |

## Running it locally

You need [Node.js](https://nodejs.org) 22.12+ (or 20.19+) and npm.

```bash
git clone https://github.com/AliceUwase/Retain.git
cd Retain/retain-web-app
npm install
npm run dev
```

Then open http://localhost:5173.

| Command (inside `retain-web-app/`) | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Type-checks, then builds to `dist/` |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run lint` | Runs ESLint |


## API
