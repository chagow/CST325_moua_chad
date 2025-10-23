CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

INSERT INTO products (id, name, price) VALUES
(1, 'Apple', 1.99),
(2, 'Orange', 2.99),
(3, 'Grapes', 1.99);