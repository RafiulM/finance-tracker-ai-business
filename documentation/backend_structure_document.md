# Backend Structure Document

# Backend Structure Document

This document outlines the backend architecture, database management, API design, hosting, infrastructure, security, and monitoring strategies for the business finance tracker web application. It is written in everyday language, ensuring clarity for all stakeholders.

## 1. Backend Architecture

### Overview
- We use **Node.js** together with the **Next.js** framework’s API routes to handle all server-side logic.  
- **Drizzle ORM** sits between our code and the database, simplifying query building and migrations.
- The code follows a **layered pattern**:  
  1. **API Routes** (entry points)  
  2. **Controllers/Handlers** (coordinate requests and responses)  
  3. **Services** (business logic, data validation)  
  4. **Repositories/Models** (database access via Drizzle ORM)

### Scalability, Maintainability, Performance
- **Scalability:** Using Next.js API routes means endpoints can be deployed serverless (e.g., on Vercel or AWS Lambda), automatically scaling with traffic.  
- **Maintainability:** Clear layer separation and consistent naming conventions make it easy to add features or fix bugs.  
- **Performance:** Drizzle ORM optimizes queries. Serverless functions spin up quickly. We can add caching (e.g., Redis) as needed.

## 2. Database Management

### Technology
- **Type:** Relational (SQL)  
- **System:** PostgreSQL  
- **ORM:** Drizzle ORM for schema definitions, migrations, and queries.

### Data Storage & Access
- Data is stored in structured tables (expenses, incomes, assets, users, settings).  
- Drizzle ORM generates and runs SQL under the hood.  
- We use connection pooling to manage database connections efficiently.

### Data Practices
- **Migrations:** Every schema change is tracked via Drizzle migration files.  
- **Backups:** Daily automated backups of the PostgreSQL database.  
- **Indexes:** We add indexes on common filter columns (e.g., `date`, `category`) for faster queries.

## 3. Database Schema

Below is the PostgreSQL schema in human-readable form, followed by SQL statements.

### Human-Readable Schema
- **users**: stores business user credentials and settings.  
  • id  
  • email  
  • password_hash  
  • business_name  
  • fiscal_year_start  
  • currency_code  
  • created_at  

- **expenses**: logs each expense entry.  
  • id  
  • user_id (link to users)  
  • date  
  • category  
  • vendor  
  • payment_method  
  • amount  
  • notes  
  • created_at  

- **incomes**: logs each income entry.  
  • id  
  • user_id  
  • date  
  • category  
  • client  
  • payment_method  
  • amount  
  • notes  
  • created_at  

- **assets**: tracks business assets.  
  • id  
  • user_id  
  • name  
  • acquisition_date  
  • value  
  • type  
  • notes  
  • created_at  

### SQL Schema (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  fiscal_year_start DATE NOT NULL,
  currency_code CHAR(3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  vendor VARCHAR(255),
  payment_method VARCHAR(50),
  amount NUMERIC(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incomes table
CREATE TABLE incomes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  client VARCHAR(255),
  payment_method VARCHAR(50),
  amount NUMERIC(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  acquisition_date DATE NOT NULL,
  value NUMERIC(12,2) NOT NULL,
  type VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```  

## 4. API Design and Endpoints

We follow a **RESTful** approach. All endpoints live under `/api`.

### Authentication
- `POST /api/auth/signup` — create a new user  
- `POST /api/auth/login` — user login, returns JWT  
- `GET /api/auth/me` — fetch current user profile (requires token)

### Business Settings
- `PUT /api/user/settings` — update business name, fiscal start, currency  
- `GET /api/user/settings` — fetch current settings

### Financial Entries
- **Expenses**  
  • `GET /api/expenses` — list expenses with filters (date, category)  
  • `POST /api/expenses` — add a new expense  
  • `PUT /api/expenses/:id` — update an expense  
  • `DELETE /api/expenses/:id` — delete an expense

- **Incomes**  
  • `GET /api/incomes`  
  • `POST /api/incomes`  
  • `PUT /api/incomes/:id`  
  • `DELETE /api/incomes/:id`

- **Assets**  
  • `GET /api/assets`  
  • `POST /api/assets`  
  • `PUT /api/assets/:id`  
  • `DELETE /api/assets/:id`

### Reports & Exports
- `GET /api/dashboard/summary` — returns aggregated data for charts  
- `GET /api/reports/excel` — generates and returns an Excel file

### AI Assistant
- `POST /api/ai/chat` — send a user message, returns GPT-4.1 response and actions (e.g., prompts to add missing data)

## 5. Hosting Solutions

### Web & APIs
- We recommend **Vercel** (native for Next.js) for automatic deployments and serverless scaling.  
- Alternatively, **AWS Lambda** + **API Gateway** for serverless or **AWS ECS/EKS** for containers.

### Database
- **AWS RDS (PostgreSQL)** or **Heroku Postgres**.  
- Automated backups, multi-AZ replication for high availability.

### File Storage (Exports)
- **AWS S3** for storing temporary Excel files (if needed).

## 6. Infrastructure Components

- **CDN:** Vercel includes a global CDN. For custom, use **Cloudflare** or **AWS CloudFront**.  
- **Load Balancer:** Managed by Vercel/AWS; distributes traffic evenly.  
- **Caching:** Add **Redis** for session storage or caching heavy queries.  
- **Task Queue:** Optional **BullMQ** or **AWS SQS** for background tasks (e.g., large Excel generation).

## 7. Security Measures

- **Authentication:** JWT tokens, stored securely in HTTP-only cookies.  
- **Authorization:** Middleware checks token and user ownership of data.  
- **Encryption:** All traffic over HTTPS (TLS).  
- **Environment Variables:** Secrets (DB credentials, OpenAI API keys) in secure env vars or AWS Secrets Manager.  
- **Rate Limiting:** Prevent abuse of AI/chat endpoint.  
- **Input Validation & Sanitization:** Prevent SQL injection, XSS.

## 8. Monitoring and Maintenance

- **Logging:** Structured logs via **Winston** or **Pino**, shipped to **Datadog** or **CloudWatch**.  
- **Error Tracking:** **Sentry** for real-time error alerts.  
- **Performance Metrics:** Use **Prometheus** + **Grafana** or built-in Vercel analytics.  
- **Uptime Monitoring:** **Pingdom** or **UptimeRobot** for endpoint checks.  
- **Maintenance:** Regular dependency updates, automated security scans (e.g., **Dependabot**), and quarterly architecture reviews.

## 9. Conclusion and Overall Backend Summary

This backend is built with modern, scalable tools—Node.js/Next.js API routes for serverless flexibility, PostgreSQL for reliable data storage, Drizzle ORM for clean database access, and OpenAI’s GPT-4.1 for intelligent assistance. Hosting on Vercel (or AWS) ensures high availability without heavy operational overhead. Security, monitoring, and maintenance practices keep the system robust and compliant. Together, these components deliver a maintainable, high-performing backend that meets the project’s needs for tracking finances, generating insights, and exporting reports, all wrapped in a user-friendly chat-style interface.

---
**Document Details**
- **Project ID**: ec473bf4-ddb2-4ff4-8740-6df58f387758
- **Document ID**: 5462f210-ccb7-4a09-8af2-e6883beac659
- **Type**: custom
- **Custom Type**: backend_structure_document
- **Status**: completed
- **Generated On**: 2025-10-02T11:35:18.008Z
- **Last Updated**: N/A
