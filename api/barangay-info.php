<?php
require __DIR__ . '/includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$stmt = $pdo->query('SELECT * FROM barangay_info LIMIT 1');
$info = $stmt->fetch();

json_ok($info ?: []);
