# Ledger — Project Study Guide

Use this file to prepare to explain Ledger confidently to anyone: an interviewer, a friend, or a recruiter. Work through each section in order.

---

## 1. The 30-Second Pitch

> *What is it, who is it for, and what problem does it solve?*

**Ledger is a personal finance web app** where users can track income and expenses across multiple accounts, set monthly category budgets, and get AI-powered financial advice. I built it as a full-stack project to practice REST API design, JWT authentication, relational database modeling, and connecting a React frontend to a Python backend.

Practice saying this out loud until it takes under 30 seconds and feels natural.

---

## 2. Technical Architecture

```
User Browser (React + Tailwind CSS)
         |
         | HTTP / JSON
         v
  FastAPI Backend (Python)
         |
    SQLAlchemy ORM
         |
     SQLite Database
         |
    OpenAI API (AI Advisor)
```

### Tech Stack at a Glance

| Layer | Technology | Why This Choice |
|---|---|---|
| Frontend | React + Tailwind CSS | Component-based UI, utility-first styling |
| Backend | Python + FastAPI | Built-in Pydantic validation, auto OpenAPI docs, async support |
| Database | SQLite + SQLAlchemy | Lightweight, file-based, perfect for a personal app |
| Auth | JWT (JSON Web Tokens) + bcrypt | Industry-standard stateless authentication |
| AI | OpenAI API | Powers the AI financial advisor feature |
| Deployment | Render (render.yaml) | Free tier, zero-config deploys from GitHub |

---

## 3. Data Model — Know This Cold

This is the skeleton of the entire app. Every feature touches these tables.

```
User
  id, email, username, hashed_password
  └── has many Accounts

Account
  id, user_id (FK), name, type
  └── has many Transactions

Transaction
  id, account_id (FK), amount, date, description, type, category
  (type is either 'income' or 'expense')

Category
  id, name  (standalone lookup table)

Budget
  id, user_id (FK), category, monthly_limit, month, year
```

**Key relationship to explain**: A User owns Accounts. Each Account owns Transactions. Budgets are linked to a User + Category + Month/Year combination so you can set different limits each month.

---

## 4. How the App Works — Feature by Feature

### Authentication Flow
1. User registers → password is hashed with **bcrypt** → stored in `users` table
2. User logs in → bcrypt verifies the hash → server returns a **JWT token**
3. All protected routes check the JWT in the `Authorization: Bearer <token>` header

### Transactions
- CRUD operations on the `transactions` table
- Each transaction belongs to an account and has a category (string) and type (`income` or `expense`)
- The frontend can filter/sort transactions by date, category, or type

### Budgets
- User sets a `monthly_limit` for a category in a given month/year
- The backend compares actual spending (sum of transactions) against the limit
- Shows how much of the budget has been used

### AI Advisor
- Sends the user's recent transaction data to OpenAI
- Returns personalized financial advice (e.g., "You're overspending on dining — consider setting a $200/month budget")

### App Startup (Lifespan)
- `main.py` uses FastAPI's `lifespan` context manager
- On startup: creates all DB tables (`Base.metadata.create_all`) and seeds default categories if none exist
- This means first-time setup is automatic — no migration scripts needed

---

## 5. Key Files and What They Do

```
backend/
  main.py          — FastAPI app setup, CORS, route registration, DB init on startup
  db_models.py     — SQLAlchemy table definitions (User, Account, Transaction, etc.)
  database.py      — DB engine and session creation
  auth_utils.py    — JWT creation/verification, password hashing
  schemas.py       — Pydantic request/response models
  app/routes/
    auth.py        — /api/auth/register, /api/auth/login
    transactions.py — CRUD for transactions
    accounts.py    — CRUD for accounts
    budgets.py     — budget endpoints
    categories.py  — category list
    ai_advisor.py  — OpenAI-powered advice endpoint

frontend/src/     — React components, pages, API calls
```

---

## 6. Concepts You Can Explain

Each of these is something you built and can speak to:

- **REST API design** — proper use of GET/POST/PUT/DELETE, resource-based URL structure (`/api/transactions`, `/api/accounts`)
- **ORM (Object-Relational Mapper)** — SQLAlchemy maps Python classes to DB tables; you write Python instead of raw SQL
- **JWT Authentication** — stateless; the token carries user identity so the server doesn't need sessions
- **Password hashing** — bcrypt is a one-way hash; even if the DB leaks, passwords aren't exposed
- **Pydantic validation** — FastAPI uses Pydantic models to validate request bodies automatically, returning 422 errors for bad data
- **CORS** — Cross-Origin Resource Sharing middleware lets the React frontend (on a different port/domain) call the FastAPI backend
- **Database relationships** — foreign keys, one-to-many relationships, SQLAlchemy `relationship()` and `back_populates`
- **Deployment** — `render.yaml` defines both the web service and any config, enabling one-click deploys

---

## 7. Interview Q&A — Practice These Out Loud

**Q: Walk me through how Ledger works at a high level.**
> A: It's a full-stack finance tracker. The React frontend communicates with a FastAPI backend over REST. The backend uses SQLAlchemy to read and write to a SQLite database. Users authenticate with JWT — they register, get a token on login, and send that token with every request. The main features are tracking transactions across accounts, setting monthly budgets per category, and an AI advisor that reads your spending data and gives personalized suggestions.

**Q: Why did you use FastAPI instead of Flask?**
> A: FastAPI automatically generates OpenAPI/Swagger documentation, which is great for testing endpoints. More importantly, it uses Pydantic for automatic request validation — if a field is missing or the wrong type, FastAPI returns a 422 error without me writing any validation code. Flask is simpler to start with but requires more manual validation work. For a REST API, FastAPI's features made it the better choice.

**Q: How does authentication work in Ledger?**
> A: When a user registers, their password is hashed using bcrypt — a slow hashing algorithm specifically designed so brute-force attacks are expensive. The hash is stored in the database, never the plain password. On login, I compare the submitted password against the stored hash. If it matches, the server signs and returns a JWT containing the user's ID. For protected routes, the client includes that token in the Authorization header, and the server verifies the signature before processing the request.

**Q: What is SQLAlchemy and why did you use it?**
> A: SQLAlchemy is an ORM — it lets me define database tables as Python classes and write queries using Python methods instead of raw SQL. This means I get type safety, easier refactoring, and protection against SQL injection by default. For example, instead of writing `SELECT * FROM transactions WHERE account_id = ?`, I write `db.query(Transaction).filter(Transaction.account_id == id).all()`.

**Q: What would you improve if you had more time?**
> A: Three things. First, I'd switch from SQLite to PostgreSQL for production — SQLite doesn't handle concurrent writes well. Second, I'd add CSV/bank statement import so users can bulk-load real transactions instead of entering them manually. Third, I'd improve the JWT flow by adding refresh tokens so users don't get logged out every time the access token expires.

**Q: How did you handle the connection between React and FastAPI?**
> A: The FastAPI backend has CORS middleware configured with the allowed origins — localhost:3000 for development and the Render deployment URL for production. The React frontend makes `fetch` calls to the API endpoints and stores the JWT in localStorage. Every API call includes the token in the Authorization header.

---

## 8. Weak Points & Honest Answers

Interviewers respect self-awareness. Know these:

- **SQLite in production**: SQLite is a file-based database — great for development but not ideal for production (no concurrent writes). A real production app would use PostgreSQL.
- **No refresh tokens**: The JWT expires and forces re-login. A proper auth flow uses short-lived access tokens + long-lived refresh tokens.
- **The `progress.json` pattern** (from the CLI): Storing state in a flat file doesn't scale — it's fine for a single user but not multi-user.
- **No test suite**: Adding pytest tests for the API routes would make the app more maintainable and catch regressions.

---

## 9. Self-Test Checklist

Before an interview, make sure you can answer YES to all of these:

- [ ] Can I draw the data model from memory (User → Account → Transaction)?
- [ ] Can I explain what JWT is and why it's stateless?
- [ ] Can I explain what an ORM is in one sentence?
- [ ] Can I explain why bcrypt is used for passwords?
- [ ] Can I explain what CORS is and why it matters for full-stack apps?
- [ ] Can I explain the difference between FastAPI and Flask in 2 sentences?
- [ ] Can I describe one honest limitation of this project and what I'd do differently?
- [ ] Can I give the 30-second pitch without notes?

---

## 10. One-Line Answers for Small Talk

- **"What's Ledger?"** → "A personal finance tracker I built — you log income and expenses across accounts, set monthly budgets, and there's an AI that gives you spending advice."
- **"What tech did you use?"** → "Python FastAPI on the backend, React with Tailwind on the frontend, SQLite for the database, and JWT for auth."
- **"What did you learn building it?"** → "Mostly how to connect all the pieces of a full-stack app — especially auth flow and how ORMs map Python to SQL."
