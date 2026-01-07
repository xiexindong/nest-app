-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS nest_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE nest_app;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    resetPasswordToken VARCHAR(255) NULL,
    resetPasswordExpires DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始用户数据
INSERT IGNORE INTO users (username, password, email, name, role, createdAt, updatedAt) VALUES
('admin', '6b93ccba414ac1d0ae1e77f3fac560c748a6701ed6946735a49d463351518e16', 'admin@example.com', '张三', 'admin', NOW(), NOW()),
('user', '6b93ccba414ac1d0ae1e77f3fac560c748a6701ed6946735a49d463351518e16', 'user@example.com', '李四', 'user', NOW(), NOW()),
('guest', '6b93ccba414ac1d0ae1e77f3fac560c748a6701ed6946735a49d463351518e16', 'guest@example.com', '王五', 'guest', NOW(), NOW());
