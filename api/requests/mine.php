<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
$residentId = require_resident();

$stmt = $pdo->prepare('SELECT * FROM service_requests WHERE resident_id = ? ORDER BY requested_at DESC');
$stmt->execute([$residentId]);
$rows = $stmt->fetchAll();

foreach ($rows as &$r) {
    $r['details'] = json_decode($r['details'] ?? '{}', true) ?: [];
}

json_ok($rows);
