# 🛒 E-Commerce Web Application

A full-featured e-commerce platform built with **FastAPI**, **React**, and **PostgreSQL**.

---

## 🚀 Features

- 🛍️ Product catalog with search and filtering
- 🏢 Department-based product organization
- 🔍 Advanced product search
- 📱 Responsive frontend built with React
- 🚀 Fast, asynchronous API using FastAPI
- 🔒 Secure authentication with JWT
- 📊 Alembic-powered database migrations
- 🧪 Unit & integration testing with Pytest

---

## ⚙️ Tech Stack

**Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL  
**Frontend**: React.js, Axios  
**Database**: PostgreSQL (SQLite available for dev)  
**Auth**: JWT (python-jose + passlib)  
**Testing**: Pytest, Pytest-Asyncio  
**Dev Tools**: Black, Flake8, Mypy

---

## 🛠️ Quick Start Guide

### 🔁 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-app.git
cd ecommerce-app
```

---

### 🐍 2. Set Up the Backend (FastAPI)

#### 📦 Install Dependencies

```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### 🔐 Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

### 🧱 3. Initialize the Database

```bash
alembic upgrade head
python scripts/load_data.py  # Optional
```

---

### ⚙️ 4. Start the FastAPI Server

```bash
uvicorn api.app:app --reload
```

- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

## 🌐 5. Run the Frontend (React)

```bash
cd frontend
npm install
npm start
```

> React app runs at `http://localhost:3000`

---

## 🧪 6. Run Tests

```bash
pytest
```

---

## 📝 API Endpoints Summary

| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| GET    | `/api/products`         | Get all products             |
| GET    | `/api/products/{id}`    | Get product by ID            |
| GET    | `/api/departments`      | List departments             |
| POST   | `/auth/register`        | User registration            |
| POST   | `/auth/login`           | User login (returns JWT)     |

---

## 📦 Deployment

Use Uvicorn, Gunicorn, or Nginx for backend. Use PostgreSQL in production.

---

## 👨‍💻 Author

**Your Name**  
GitHub: [@yourusername](https://github.com/sritankar)  
Email: sritankar3239@gmail.com

---

## 📄 License

This project is licensed under the MIT License.
