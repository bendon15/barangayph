<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
$residentId = require_resident();

$stmt = $pdo->prepare(
    'SELECT id, first_name, middle_name, last_name, suffix, birthdate, gender, civil_status,
            purok, address, contact_number, email, is_verified, created_at
     FROM residents WHERE id = ?'
);
$stmt->execute([$residentId]);
$resident = $stmt->fetch();

if (!$resident) json_error('Profile not found.', 404);

json_ok($resident);
