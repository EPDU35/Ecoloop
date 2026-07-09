-- Supprimer tous les users SAUF l'admin principal
DELETE FROM users 
WHERE email != 'elielpaul03@gmail.com';

-- Vérification
SELECT id, full_name, email, phone, role, is_active, is_verified, created_at
FROM users
ORDER BY created_at;