# Project Requirements Document

# Tech Stack Document

This document explains, in everyday language, how we built your business finance tracker. It shows which technologies we chose, why we chose them, and how they all work together to give you a smooth, secure, and reliable experience.

## 1. Frontend Technologies

These are the tools we use to build everything you see and interact with in your browser:

*   **Next.js**\
    A React-based framework that handles page routing, fast loading, and server-side rendering out of the box. It helps pages load quickly and improves search-engine visibility.
*   **TypeScript**\
    A typed version of JavaScript that catches mistakes early. It makes our code more reliable and easier to maintain over time.
*   **Tailwind CSS**\
    A utility-first styling tool that lets us write clean, responsive, and consistent styles. We set up a green-primary palette so all colors on the dashboard, buttons, and charts look unified.
*   **Shadcn UI**\
    A set of pre-built, accessible React components (buttons, forms, modals, etc.). It speeds up development and ensures UI elements follow best accessibility practices.
*   **Chart.js (via react-chartjs-2)**\
    A popular charting library wrapped for React. We use it for your line charts, bar charts, and tables, complete with tooltips and hover effects.

## 2. Backend Technologies

Behind the scenes, these tools handle your data, power the AI assistant, and manage exports:

*   **Next.js API Routes**\
    Built into Next.js, these serverless endpoints receive your chat messages, validate inputs, and coordinate data operations.
*   **PostgreSQL**\
    A reliable, open-source database where all your expenses, incomes, and assets are stored in structured tables.
*   **Drizzle ORM**\
    A lightweight library that translates our database schema into easy-to-use JavaScript/TypeScript calls. It keeps SQL details under the hood and helps us run migrations safely.
*   **OpenAI GPT-4.1 API**\
    Powers the chat-based AI assistant. When you type in a transaction or ask for insights, we send the text to OpenAI, get back structured data or analysis, and present it in the chat and dashboard.
*   **ExcelJS**\
    A JavaScript library that generates Excel (.xlsx) files on the server. When you click Export, it builds a workbook with separate sheets for expenses, income, and assets, including pivot-style summaries.

## 3. Infrastructure and Deployment

These choices make developing, testing, and deploying your app smooth and scalable:

*   **Git & GitHub**\
    Version control and remote code hosting. Every change is tracked, reviewed, and safely merged.
*   **Docker & Docker Compose**\
    Containers for local development. They mimic the production environment so "it works on my machine" issues are minimized.
*   **Vercel**\
    Preferred hosting for Next.js apps. It automatically builds, optimizes, and deploys each commit.
*   **GitHub Actions**\
    Continuous Integration/Continuous Deployment (CI/CD) pipelines. On every push, tests run and—if they pass—a new version goes live.
*   **Environment Variables (.env)**\
    Securely stores secrets (database URLs, API keys) outside of the codebase.

## 4. Third-Party Integrations

We keep integrations focused on your core needs:

*   **OpenAI**\
    For the GPT-4.1 AI assistant that handles natural-language inputs and financial insights.
*   **ExcelJS**\
    To create downloadable Excel reports that mirror your dashboard data.

*No payment processors, bank APIs, or analytics tools are integrated in this version.*

## 5. Security and Performance Considerations

Keeping your data safe and the app fast were top priorities:

*   **Authentication & Session Management**\
    We use NextAuth.js (built into Next.js) for secure sign-up, sign-in, password hashing, and session handling.
*   **HTTPS Everywhere**\
    All data in transit is encrypted.
*   **CSRF Protection & CORS Rules**\
    Guard against unauthorized requests.
*   **Input Validation**\
    On both the chat interface and API side, we check that dates, amounts, and categories look correct before saving.
*   **Database Indexes & Query Optimization**\
    Fast lookups on date and category fields to keep the dashboard responsive.
*   **Code Splitting & Lazy Loading**\
    Only load charting code and dashboard widgets when you actually visit those pages, reducing initial load time.

## 6. Conclusion and Overall Tech Stack Summary

Your finance tracker is powered by a modern, well-integrated stack:

*   Frontend: Next.js, TypeScript, Tailwind CSS, Shadcn UI, Chart.js
*   Backend: Next.js API Routes, PostgreSQL, Drizzle ORM, OpenAI GPT-4.1, ExcelJS
*   Infrastructure: Git/GitHub, Docker, Vercel, GitHub Actions
*   Security & Performance: NextAuth, HTTPS, CSRF/CORS, validation, indexing, code splitting

Each choice aligns with your goal of a clean, conversational data-entry interface, a green-themed interactive dashboard, and reliable Excel exports. This stack ensures ease of development today and room to grow—whether that means adding bank integrations, multi-user roles, or more chart types in the future.


---
**Document Details**
- **Project ID**: ec473bf4-ddb2-4ff4-8740-6df58f387758
- **Document ID**: 539d01fd-cc96-4e18-92c5-958b11c7aeb2
- **Type**: custom
- **Custom Type**: project_requirements_document
- **Status**: completed
- **Generated On**: 2025-10-02T11:32:29.261Z
- **Last Updated**: 2025-10-02T11:40:31.515Z
