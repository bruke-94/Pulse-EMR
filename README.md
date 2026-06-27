# Pulse EMR

Pulse EMR is a capstone-level Electronic Medical Record system built with Node.js + Express.js + a separate vanilla JavaScript frontend.

It demonstrates:

- REST API design
- MVC architecture
- Authentication and Authorization
- JWT-based sessions
- Password hashing with bcrypt
- Request logging and structured application logs
- Relational database modeling (PostgreSQL)

## 1. Tech Stack

- Backend: Node.js, Express.js, PostgreSQL, JWT, bcryptjs, Joi, Helmet, Morgan
- Frontend: HTML, CSS, Vanilla JavaScript (Fetch API)
- Database: PostgreSQL (relational schema + DDL)

## 2. Project Structure

```text
emr-final-project/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
    .env.example
    package.json
  frontend/
    index.html
    css/styles.css
    js/app.js
  database/
    schema.sql
  docs/
    er-diagram.md
```

## 3. Setup Instructions

### 3.1 Prerequisites

- Node.js 18+
- npm
- PostgreSQL 14+

### 3.2 Database Setup

1. Create database:

```bash
sudo -u postgres psql -c "CREATE DATABASE emr_db;"
```

2. Run schema:

```bash
psql -U postgres -d emr_db -f /absolute/path/to/emr-final-project/database/schema.sql
```

### 3.3 Backend Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `.env` values for your PostgreSQL credentials.

4. Start API server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3.4 Frontend Setup

Open `frontend/index.html` with Live Server or any static server.

Recommended origin for CORS is already set to `http://127.0.0.1:5500`.

## 4. API Overview

Base URL: `http://localhost:5000/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Users

- `GET /users/doctors` (requires JWT) — list doctors for selection in the UI

### Patients (JWT required)

- `GET /patients`
- `GET /patients/:id`
- `POST /patients`

### Appointments (JWT required)

- `GET /appointments`
- `POST /appointments`

## 5. Security & Course Requirements Coverage

- Authentication: email/password login
- Authorization: role-based route guards (`admin`, `doctor`, `nurse`, `receptionist`)
- JWT: bearer token authentication middleware
- Hashing: bcrypt password hashing
- MVC: routes/controllers/models separated in backend
- Relational DB: PostgreSQL schema and foreign key relationships

## 6. Database Artifacts

- DDL: `database/schema.sql`
- ER Diagram (Mermaid): `docs/er-diagram.md`

## 7. Demo Users

Register users through `/api/auth/register` with one of the supported roles:

- `admin`
- `doctor`
- `nurse`
- `receptionist`
