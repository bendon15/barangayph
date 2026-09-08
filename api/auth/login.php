<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = read_json_body();
$email = strtolower(trim($b['email'] ?? ''));
$password = $b['password'] ?? '';
if ($email === '' || $password === '') json_error('Email and password are required.');

$stmt = $pdo->prepare('SELECT * FROM residents WHERE email = ?');
$stmt->execute([$email]);
$resident = $stmt->fetch();

if (!$resident || !password_verify($password, $resident['password_hash'])) {
    json_error('Invalid email or password.', 401);
}

session_regenerate_id(true);
$_SESSION['resident_id'] = $resident['id'];
unset($_SESSION['admin']);

json_ok(['id' => $resident['id'], 'name' => $resident['first_name'] . ' ' . $resident['last_name']]);
