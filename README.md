# NITJ Academic Resource & Notes Exchange System

> Internal academic resource sharing platform for NIT Jalandhar

## 🏗️ Architecture

```
AcademicResourceExchangeSystem/
├── .env                    # Environment configuration
├── .env.example            # Environment template
├── docker-compose.yml      # Local MongoDB + backend
├── .gitignore
├── README.md
├── backend/                 # Express.js Backend
│   ├── Dockerfile          # Dev image (nodemon + live reload)
│   ├── package.json
│   └── src/
│       ├── index.js        # Entry point
│       ├── config/         # DB & env config
│       ├── controllers/    # Route handlers
│       ├── middleware/      # Auth, roles, errors, upload
│       ├── models/         # MongoDB schemas (8 models)
│       ├── routes/         # API route definitions
│       ├── seeds/          # Database seed data
│       └── utils/          # Helpers, constants, errors
└── frontend/                 # React Frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    │   └── nitj-logo.png
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css       # Tailwind + NITJ theme
        ├── api/            # Axios config
        ├── components/     # Layout + shared components
        ├── contexts/       # Auth context
        ├── hooks/          # Custom hooks
        ├── pages/          # Route pages
        └── utils/          # Constants
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local via Docker, or MongoDB Atlas)
- Docker Desktop (optional — for one-command backend + MongoDB)

### 1. Configure Environment
```bash
# Copy and edit the .env file
cp .env.example .env
# Set JWT_SECRET (required). For Docker Compose, MONGODB_URI is overridden automatically.
```

### Docker Compose (backend + MongoDB)

Spin up MongoDB and the Express API with live reload:

```bash
docker compose up --build
```

- API: http://localhost:5000
- Health: http://localhost:5000/api/health
- MongoDB: `localhost:27017` (data persisted in the `mongo_data` volume)

Seed the database (once containers are running):

```bash
docker compose exec backend npm run seed
```

Stop and remove containers (volumes keep DB/uploads data):

```bash
docker compose down
```

Run the frontend separately on the host (`cd frontend && npm run dev`) — it is not part of this Compose file.

### Local setup (without Docker)

### 2. Install Dependencies
```bash
# Server
cd backend && npm install

# Client
cd ../frontend && npm install
```

### 3. Seed Database
```bash
cd backend
npm run seed
```

### 4. Run Development Servers
```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

### 5. Open
- Frontend: http://localhost:5173
- API Health: http://localhost:5000/api/health

## 👤 Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nitj.ac.in | admin123 |
| Teacher | teacher@nitj.ac.in | teacher123 |
| Student | student@nitj.ac.in | 21105001 |

## 📦 Tech Stack
- **Frontend:** React 19, Tailwind CSS 4, React Router 7, Axios
- **Backend:** Express.js, Mongoose, JWT, bcrypt
- **Database:** MongoDB Atlas
- **Storage:** Local file system

## 🔒 Security
- JWT authentication
- bcrypt password hashing
- Helmet HTTP headers
- Rate limiting
- Role-based access control
- File type validation
- Input sanitization

## 📝 License
NIT Jalandhar — Internal Use