-- Store Rating Platform Database Schema
-- MySQL 8.x compatible

DROP DATABASE IF EXISTS store_rating_db;
CREATE DATABASE store_rating_db;
USE store_rating_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role ENUM('admin', 'user', 'store_owner') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_name_len CHECK (CHAR_LENGTH(name) >= 2 AND CHAR_LENGTH(name) <= 60),
    CONSTRAINT chk_address_len CHECK (address IS NULL OR CHAR_LENGTH(address) <= 400)
);

-- Stores table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_store_name_len CHECK (CHAR_LENGTH(name) >= 2 AND CHAR_LENGTH(name) <= 60)
);

-- Ratings table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT uq_user_store UNIQUE (user_id, store_id)
);

-- Index for faster lookups
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);

-- =============================================
-- Seed Data
-- =============================================
-- Password hash for "Admin@123" using bcrypt
-- $2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa

-- 1. Admin user
INSERT INTO users (name, email, password, address, role) VALUES
('Rajendra Vishwas Kulkarni', 'admin@storerating.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Shivajinagar, Pune, Maharashtra 411005', 'admin');

-- 2. Store owners (5)
INSERT INTO users (name, email, password, address, role) VALUES
('Suresh Ramchandra Deshmukh', 'suresh.deshmukh@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Deccan Gymkhana, Pune, Maharashtra 411004', 'store_owner'),
('Prashant Vitthal Patil', 'prashant.patil@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'FC Road, Pune, Maharashtra 411005', 'store_owner'),
('Mahesh Dattatray Joshi', 'mahesh.joshi@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Kothrud, Pune, Maharashtra 411038', 'store_owner'),
('Sandip Pandurang Bhosale', 'sandip.bhosale@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Hadapsar, Pune, Maharashtra 411028', 'store_owner'),
('Vikram Balasaheb Shinde', 'vikram.shinde@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Swargate, Pune, Maharashtra 411042', 'store_owner');

-- 3. Normal users (10)
INSERT INTO users (name, email, password, address, role) VALUES
('Aditya Chandrakant Jadhav', 'aditya.jadhav@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Baner, Pune, Maharashtra 411045', 'user'),
('Nikhil Dnyaneshwar More', 'nikhil.more@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Aundh, Pune, Maharashtra 411007', 'user'),
('Rohan Madhavrao Pawar', 'rohan.pawar@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Viman Nagar, Pune, Maharashtra 411014', 'user'),
('Swapnil Raghunath Gaikwad', 'swapnil.gaikwad@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Wakad, Pune, Maharashtra 411057', 'user'),
('Tushar Harishchandra Thorat', 'tushar.thorat@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Pimpri, Pune, Maharashtra 411018', 'user'),
('Saurabh Yashwantrao Kale', 'saurabh.kale@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Chinchwad, Pune, Maharashtra 411019', 'user'),
('Amol Shankarrao Chavan', 'amol.chavan@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Kondhwa, Pune, Maharashtra 411048', 'user'),
('Sachin Gangadhar Salunkhe', 'sachin.salunkhe@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Katraj, Pune, Maharashtra 411046', 'user'),
('Yogesh Ramkrishna Deshpande', 'yogesh.deshpande@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Bibwewadi, Pune, Maharashtra 411037', 'user'),
('Prasad Govindrao Mane', 'prasad.mane@email.com', '$2a$10$ix/b/S.9G6JtIiVlyiqruuTghx3sqkcwqft7wQBrLDnqIyLB10fZa', 'Warje, Pune, Maharashtra 411058', 'user');

-- 4. Stores (5) linked to store owners
INSERT INTO stores (name, email, address, owner_id) VALUES
('Deshmukh Electronics Store', 'store.deshmukh@email.com', 'Shop 12, Laxmi Road, Pune, Maharashtra 411030', 2),
('Patil General Stores Pune', 'store.patil@email.com', 'FC Road, Near Garware College, Pune, Maharashtra 411005', 3),
('Joshi Kirana And Provisions', 'store.joshi@email.com', 'Plot 45, Kothrud Main Road, Pune, Maharashtra 411038', 4),
('Bhosale Hardware And Tools', 'store.bhosale@email.com', 'Magarpatta City, Hadapsar, Pune, Maharashtra 411028', 5),
('Shinde Clothing Collection', 'store.shinde@email.com', 'Tilak Road, Swargate, Pune, Maharashtra 411042', 6);

-- 5. Ratings (some sample ratings from normal users)
INSERT INTO ratings (user_id, store_id, rating) VALUES
(7, 1, 4),   -- Aditya rates Deshmukh Electronics
(8, 1, 5),   -- Nikhil rates Deshmukh Electronics
(9, 1, 3),   -- Rohan rates Deshmukh Electronics
(10, 2, 4),  -- Swapnil rates Patil General Stores
(11, 2, 5),  -- Tushar rates Patil General Stores
(7, 2, 4),   -- Aditya rates Patil General Stores
(12, 3, 3),  -- Saurabh rates Joshi Kirana
(13, 3, 5),  -- Amol rates Joshi Kirana
(14, 4, 2),  -- Sachin rates Bhosale Hardware
(15, 4, 4),  -- Yogesh rates Bhosale Hardware
(16, 4, 5),  -- Prasad rates Bhosale Hardware
(8, 5, 4),   -- Nikhil rates Shinde Clothing
(9, 5, 3),   -- Rohan rates Shinde Clothing
(10, 5, 5),  -- Swapnil rates Shinde Clothing
(11, 5, 4);  -- Tushar rates Shinde Clothing
