<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
require_admin();

$stmt = $pdo->query(
    'SELECT id, first_name, middle_name, last_name, suffix, birthdate, gender, civil_status,
            purok, address, contact_number, email, is_verified, created_at
     FROM residents ORDER BY created_at DESC'
);

json_ok($stmt->fetchAll());
