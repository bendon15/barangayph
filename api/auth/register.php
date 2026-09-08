<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = read_json_body();
$required = ['first_name', 'last_name', 'birthdate', 'gender', 'purok', 'address', 'contact_number', 'email', 'password'];
foreach ($required as $field) {
    if (empty($b[$field])) json_error("Missing required field: {$field}");
}

if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) json_error('Please provide a valid email address.');
if (strlen($b['password']) < 6) json_error('Password must be at least 6 characters.');

$check = $pdo->prepare('SELECT id FROM residents WHERE email = ?');
$check->execute([$b['email']]);
if ($check->fetch()) json_error('An account with that email already exists.');

$id = uuid_v4();
$hash = password_hash($b['password'], PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    'INSERT INTO residents
     (id, first_name, middle_name, last_name, suffix, birthdate, gender, civil_status, purok, address, contact_number, email, password_hash, is_verified, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,NOW())'
);
$stmt->execute([
    $id,
    trim($b['first_name']),
    trim($b['middle_name'] ?? ''),
    trim($b['last_name']),
    trim($b['suffix'] ?? ''),
    $b['birthdate'],
    $b['gender'],
    trim($b['civil_status'] ?? 'Single'),
    $b['purok'],
    trim($b['address']),
    trim($b['contact_number']),
    strtolower(trim($b['email'])),
    $hash,
]);

json_ok(['id' => $id], 201);
