# Store Rating Platform

A full-stack web application that allows users to rate stores. Built with Node.js, Express, MySQL, and React (Vite). Supports three user roles — **Admin**, **Normal User**, and **Store Owner** — each with dedicated dashboards and permissions.

---

## Technologies Used

| Layer          | Technology           | Version   |
|----------------|----------------------|-----------|
| Backend        | Node.js              | 18+       |
| Backend        | Express.js           | ^4.21.0   |
| Database       | MySQL                | 8.x       |
| Frontend       | React.js             | ^19.0.0   |
| Frontend       | Vite                 | ^6.0.0    |
| Auth           | jsonwebtoken (JWT)   | ^9.0.2    |
| Auth           | bcryptjs             | ^2.4.3    |
| HTTP Client    | axios                | ^1.7.0    |
| Routing        | react-router-dom     | ^7.1.0    |
| DB Driver      | mysql2               | ^3.11.0   |
| Middleware      | cors                 | ^2.8.5    |
| Config         | dotenv               | ^16.4.5   |

---

## Features

### Admin
- View dashboard with total users, stores, and ratings
- Add new users (any role) and stores
- View all users and stores with filtering and sorting
- View ratings submitted on any store

### Normal User
- Sign up and log in
- Browse all stores with average ratings
- Submit or update a rating (1–5 stars) for any store
- Change password

### Store Owner
- View dashboard with owned store stats
- See ratings and average rating for their own stores

---

## Project Structure

```
Roxiler_Systems_Assessment_FSD/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── database/
│   │   └── schema.sql             # Database schema + seed data
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication middleware
│   │   └── validate.js            # Input validation middleware
│   ├── routes/
│   │   ├── auth.js                # Signup, login, change password
│   │   ├── dashboard.js           # Admin & store owner dashboards
│   │   ├── stores.js              # Store CRUD, ratings
│   │   └── users.js               # User management (admin)
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── .env                       # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardCard.jsx  # Reusable stat card
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── ProtectedRoute.jsx # Auth route guard
│   │   │   └── StarRating.jsx     # Star rating component
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── pages/
│   │   │   ├── AdminAddStore.jsx
│   │   │   ├── AdminAddUser.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminStores.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── StoreOwnerDashboard.jsx
│   │   │   ├── UserDetails.jsx
│   │   │   └── UserStores.jsx
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance config
│   │   ├── App.jsx                # Route definitions
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Database Setup

Make sure MySQL is installed and running. Then import the schema:

```bash
mysql -u root -p < backend/database/schema.sql
```

This will:
1. Create the `store_rating_db` database
2. Create 3 tables: `users`, `stores`, `ratings`
3. Seed a default admin account

**Default Admin Credentials:**

| Field    | Value                    |
|----------|--------------------------|
| Email    | admin@storerating.com    |
| Password | Admin@123                |

---

## How to Add Admin from Backend

There is no admin registration form on the frontend. Admins must be created from the backend using one of the methods below.

### Method 1: Direct MySQL Insert

Passwords are stored as bcrypt hashes, so you need to generate a hash first.

**Generate bcrypt hash using Node.js:**

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('YourPassword@123', 10).then(hash => console.log(hash));
```

Run this with `node -e` or in a script to get the hash. Then insert into MySQL:

```sql
INSERT INTO users (name, email, password, address, role)
VALUES ('Admin Name', 'admin@email.com', '<bcrypt_hash>', 'Address', 'admin');
```

Replace `<bcrypt_hash>` with the hash output from the previous step.

### Method 2: Using the API (Requires an Existing Admin)

If you already have an admin account, you can create new admins through the API.

1. **Login as admin to get a JWT token:**

```
POST http://localhost:5000/api/auth/login
Body: { "email": "admin@storerating.com", "password": "Admin@123" }
```

2. **Create the new admin:**

```
POST http://localhost:5000/api/users
Headers: { "Authorization": "Bearer <admin_jwt_token>" }
Body: {
  "name": "New Admin",
  "email": "newadmin@email.com",
  "password": "NewAdmin@123",
  "address": "Some Address",
  "role": "admin"
}
```

The API automatically hashes the password before storing it. No need to manually generate a bcrypt hash.

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_rating_db
JWT_SECRET=your_jwt_secret_key
```

Start the server:

```bash
npm start
```

The backend runs on `http://localhost:5000`.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` (default Vite port).

---

## API Documentation

### Authentication APIs

| Method | Endpoint                   | Description              | Auth Required |
|--------|----------------------------|--------------------------|---------------|
| POST   | `/api/auth/signup`         | Register a new user      | No            |
| POST   | `/api/auth/login`          | Login and get JWT token  | No            |
| PUT    | `/api/auth/change-password`| Change password          | Yes           |

### User Management APIs (Admin Only)

| Method | Endpoint         | Description                          | Auth Required |
|--------|------------------|--------------------------------------|---------------|
| GET    | `/api/users`     | List all users with filters & sort   | Admin         |
| GET    | `/api/users/:id` | Get user details                     | Admin         |
| POST   | `/api/users`     | Create new user (any role)           | Admin         |

### Store APIs

| Method | Endpoint                  | Description                       | Auth Required |
|--------|---------------------------|-----------------------------------|---------------|
| GET    | `/api/stores`             | List stores with average ratings  | Yes           |
| POST   | `/api/stores`             | Create a new store                | Admin         |
| POST   | `/api/stores/:id/rate`    | Submit or update rating (1–5)     | User          |
| GET    | `/api/stores/:id/ratings` | Get ratings for a store           | Admin/Owner   |

### Dashboard APIs

| Method | Endpoint                      | Description        | Auth Required |
|--------|-------------------------------|--------------------|---------------|
| GET    | `/api/dashboard/admin`        | Admin statistics   | Admin         |
| GET    | `/api/dashboard/store-owner`  | Store owner stats  | Owner         |

---

## Form Validations

| Field    | Rules                                                            |
|----------|------------------------------------------------------------------|
| Name     | 2–60 characters                                                  |
| Email    | Must be a valid email format                                     |
| Password | 8–16 characters, at least one uppercase letter, one special char |
| Address  | Maximum 400 characters                                           |

---

## Default Login Credentials

These accounts are seeded by `schema.sql` during database setup.

| Role         | Email                        | Password       |
|--------------|------------------------------|----------------|
| Admin        | admin@storerating.com        | Admin@123      |
| Store Owner  | storeowner@storerating.com   | StoreOwner@123 |
| Normal User  | user@storerating.com         | User@1234      |

---

## License

ISC
