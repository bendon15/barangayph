<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$stmt = $pdo->query('SELECT * FROM officials ORDER BY FIELD(position, "chairman","kagawad","sk_chairman","sk_kagawad","secretary","treasurer","tanod"), display_order ASC');
json_ok($stmt->fetchAll());
