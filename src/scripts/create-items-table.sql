CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 添加索引
CREATE INDEX idx_items_created_at ON items(created_at);

-- 插入测试数据
INSERT INTO items (name, description, price, quantity) VALUES
('Apple iPhone 15', 'Latest iPhone model', 999.99, 50),
('Samsung Galaxy S24', 'Flagship Android phone', 899.99, 40),
('MacBook Pro 14', 'Powerful laptop', 1999.99, 20),
('AirPods Pro 2', 'Wireless earbuds', 249.99, 100),
('iPad Pro 12.9', 'Premium tablet', 1099.99, 30);
