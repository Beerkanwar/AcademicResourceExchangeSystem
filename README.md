# NITJ Academic Resource & Notes Exchange System

> Internal academic resource sharing platform for NIT Jalandhar

## 🏗️ Architecture

```
AcademicResourceExchangeSystem/
├── .env                    # Environment configuration
├── .env.example            # Environment template
├── .gitignore
├── README.md
├── server/                 # Express.js Backend
│   ├── package.json
│   └── src/
│       ├── index.js        # Entry point
│       ├── config/         # DB & env config
│       ├── controllers/    # Route handlers
│       ├── middleware/      # Auth, roles, errors, upload
│       ├── models/         # MongoDB schemas (10 models)
│       ├── routes/         # API route definitions
│       ├── seeds/          # Database seed data
│       └── utils/          # Helpers, constants, errors
└── client/                 # React Frontend
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
- MongoDB Atlas account (free tier works)

### 1. Configure Environment
```bash
# Copy and edit the .env file
cp .env.example .env
# Fill in your MongoDB Atlas URI and JWT secret
```

### 2. Install Dependencies
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Seed Database
```bash
cd server
npm run seed
```

### 4. Run Development Servers
```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
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