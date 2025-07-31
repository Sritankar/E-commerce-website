# Database Documentation

## Overview

The e-commerce application uses a relational database to store product and department information. The database is designed to be scalable and supports both SQLite (for development) and PostgreSQL (for production).

## Database Schema

### Tables

#### 1. departments

Stores department information for organizing products.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER/SERIAL | PRIMARY KEY, AUTO_INCREMENT | Unique department identifier |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Department name |
| `description` | TEXT | NULL | Department description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, ON UPDATE | Record update time |

#### 2. products

Stores product information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER/SERIAL | PRIMARY KEY, AUTO_INCREMENT | Unique product identifier |
| `product_id` | VARCHAR(255) | NOT NULL, UNIQUE | External product identifier |
| `product_name` | VARCHAR(500) | NOT NULL | Product name |
| `category` | VARCHAR(255) | NULL | Product category |
| `sub_category` | VARCHAR(255) | NULL | Product sub-category |
| `brand` | VARCHAR(255) | NULL | Product brand |
| `sale_price` | DECIMAL(10,2) | NULL | Current selling price |
| `market_price` | DECIMAL(10,2) | NULL | Market/original price |
| `type` | VARCHAR(255) | NULL | Product type |
| `rating` | FLOAT | NULL | Product rating (0-5) |
| `description` | TEXT | NULL | Product description |
| `department_id` | INTEGER | FOREIGN KEY, NULL | Reference to departments table |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, ON UPDATE | Record update time |

### Relationships

- **One-to-Many**: departments → products
  - One department can have many products
  - Products can optionally belong to a department

### Indexes

#### products table indexes:
- `idx_products_category` - Single column index on `category`
- `idx_products_brand` - Single column index on `brand`
- `idx_products_price` - Single column index on `sale_price`
- `idx_products_name` - Single column index on `product_name`
- `idx_products_department` - Single column index on `department_id`
- `idx_product_category_brand` - Composite index on `(category, brand)`
- `idx_product_price_rating` - Composite index on `(sale_price, rating)`
- `idx_product_search` - Composite index on `(product_name, brand, category)`

#### departments table indexes:
- `idx_departments_name` - Single column index on `name`

## Database Configuration

### SQLite (Development)

