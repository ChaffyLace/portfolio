CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    alert_threshold INT NOT NULL DEFAULT 5
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity_changed INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password, role) 
VALUES ('admin@admin.com', 'admin123', 'admin');

INSERT INTO products (sku, name, quantity, alert_threshold) 
VALUES 
('IPH-15PR-128', 'iPhone 15 Pro - 128GB - Titanium', 45, 10),
('IPH-14ST-256', 'iPhone 14 - 256GB - Midnight', 3, 8);