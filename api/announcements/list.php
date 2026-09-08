<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$stmt = $pdo->query('SELECT * FROM announcements ORDER BY is_pinned DESC, published_at DESC');
json_ok($stmt->fetchAll());
