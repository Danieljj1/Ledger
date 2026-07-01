# Ledger — Personal Finance Tracker

A full-stack app for tracking income, expenses, and spending across multiple accounts, with an AI-powered financial advisor.

## Features
- Log transactions, categorize spending, view breakdowns across accounts over time
- JWT-based authentication
- **AI Advisor** (`GET /api/ai-advisor`): aggregates a user's transaction history into an income/expense/category summary and sends it to OpenAI's `gpt-4o-mini` to generate personalized, actionable budgeting tips. Falls back to a rule-based summary if the API call fails.

## Stack
- Frontend: React
- Backend: FastAPI (Python), SQLAlchemy, Alembic migrations
- Database: PostgreSQL
- Auth: JWT
- AI: OpenAI API (gpt-4o-mini)
- Deployed on Render

## Live Demo
https://ledger-frontend-f452.onrender.com
