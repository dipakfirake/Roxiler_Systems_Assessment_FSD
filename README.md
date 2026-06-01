# Store Rating Platform

A full-stack web application that allows users to submit ratings for registered stores. The platform supports three user roles — System Administrator, Normal User, and Store Owner — each with distinct functionalities.

## Tech Stack

- **Backend:** Node.js with Express.js
- **Database:** MySQL
- **Frontend:** React.js (Vite)
- **Authentication:** JWT (JSON Web Tokens)

## Features

### System Administrator
- Dashboard showing total users, stores, and ratings
- Add/manage stores, normal users, and admin users
- View and filter users and stores with sorting capabilities

### Normal User
- Sign up and log in to the platform
- Browse and search stores by name and address
- Submit and modify ratings (1–5) for stores
- Update password

### Store Owner
- View dashboard with average rating and list of raters
- Update password

## Database Setup

1. Make sure MySQL is running on your system.
2. Open MySQL client and run the schema file:

```bash
mysql -u root -p < backend/database/schema.sql
```

This will create the `store_rating_db` database, set up all tables, and insert seed data including a default admin account.

**Default Admin Login:**
- Email: `admin@storerating.com`
- Password: `Admin@123`

## Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server runs on `http://localhost:5000`.

### Environment Variables

Create a `.env` file in the `backend/` directory:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_rating_db
JWT_SECRET=your_jwt_secret_key
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173`.

## Form Validations

| Field    | Validation Rule                                                    |
|----------|--------------------------------------------------------------------|
| Name     | Minimum 20 characters, Maximum 60 characters                      |
| Address  | Maximum 400 characters                                             |
| Password | 8–16 characters, at least one uppercase letter, one special character |
| Email    | Standard email format                                              |

## Project Structure

```
├── backend/
│   ├── config/          # Database connection
│   ├── middleware/       # Auth and validation middleware
│   ├── routes/           # API route handlers
│   ├── database/         # SQL schema and seed data
│   └── server.js         # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components
│   │   ├── context/      # React context providers
│   │   └── utils/        # API helper utilities
│   └── index.html
└── README.md
```
