-- Insertar empleado de ejemplo
INSERT INTO users (email, password, name, role, phone) 
VALUES ('empleado@negocio.com', 'emp123', 'Juan Empleado', 'employee', '+51987654321')
ON CONFLICT (email) DO NOTHING;

-- Obtener el ID del empleado para crear el registro en employees
INSERT INTO employees (user_id, position, salary, hire_date, status)
SELECT id, 'Vendedor', 1200.00, CURRENT_DATE, 'active'
FROM users 
WHERE email = 'empleado@negocio.com'
ON CONFLICT DO NOTHING;

-- Insertar más productos de ejemplo
INSERT INTO products (name, price, stock, category) VALUES
('Coca Cola 500ml', 3.50, 100, 'Bebidas'),
('Pan Integral', 4.20, 50, 'Panadería'),
('Leche Gloria 1L', 5.80, 30, 'Lácteos'),
('Arroz Superior 1kg', 4.50, 80, 'Abarrotes'),
('Aceite Primor 1L', 8.90, 25, 'Abarrotes')
ON CONFLICT DO NOTHING;
