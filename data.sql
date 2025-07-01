-- JWT End-to-End Project Database Schema
-- Database: SQLite

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;

-- Users table for authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for tracking user sessions (optional)
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users for testing
INSERT INTO users (username, email, password) VALUES 
('admin', 'admin@example.com', '$2b$10$example_hashed_password_here'),
('testuser', 'test@example.com', '$2b$10$example_hashed_password_here2');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);

-- View to show user information without password
CREATE VIEW user_info AS 
SELECT 
    id,
    username,
    email,
    created_at,
    updated_at
FROM users;
