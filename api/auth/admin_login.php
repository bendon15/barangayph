<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$b = read_json_body();
$username = strtolower(trim($b['username'] ?? ''));
$password = $b['password'] ?? '';
if ($username === '' || $password === '') json_error('Username and password are required.');

$stmt = $pdo->prepare('SELECT * FROM admins WHERE LOWER(username) = ?');
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    json_error('Invalid username or password.', 401);
}

session_regenerate_id(true);
$_SESSION['admin'] = ['id' => $admin['id'], 'name' => $admin['full_name'], 'role' => $admin['role']];
unset($_SESSION['resident_id']);

json_ok(['id' => $admin['id'], 'name' => $admin['full_name'], 'role' => $admin['role']]);
