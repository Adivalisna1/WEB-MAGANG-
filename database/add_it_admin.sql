-- Insert role IT Admin (id=4)
INSERT INTO roles (id, nama, deskripsi) 
VALUES (4, 'admin_it', 'IT Administrator (Ahli Komputer)')
ON DUPLICATE KEY UPDATE nama='admin_it';

-- Insert default IT Admin user
INSERT INTO users (role_id, nama, username, email, password_hash, is_active) 
VALUES (
    4,
    'IT Administrator',
    'it_admin',
    'it_admin@weblaporan.local',
    -- hash for: adminIT123
    '$2b$12$RZqfnp0epsP2H9T9bvkTK.qLhypnpKJDs3NHXHjpwnsDwYohbcGPW',
    1
)
ON DUPLICATE KEY UPDATE username='it_admin';
