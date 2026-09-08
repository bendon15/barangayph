<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
require_admin();

$b = read_json_body();
$id = $b['id'] ?? '';
$status = $b['status'] ?? '';
$notes = trim($b['admin_notes'] ?? '');

$validStatuses = ['pending', 'processing', 'approved', 'ready_for_pickup', 'released', 'rejected'];
if ($id === '' || !in_array($status, $validStatuses, true)) {
    json_error('A valid request id and status are required.');
}

$stmt = $pdo->prepare('UPDATE service_requests SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?');
$stmt->execute([$status, $notes, $id]);

if ($stmt->rowCount() === 0) {
    // Row may already match these exact values, or may not exist — check existence explicitly.
    $check = $pdo->prepare('SELECT id FROM service_requests WHERE id = ?');
    $check->execute([$id]);
    if (!$check->fetch()) json_error('Request not found.', 404);
}

$fetch = $pdo->prepare('SELECT * FROM service_requests WHERE id = ?');
$fetch->execute([$id]);
$row = $fetch->fetch();
$row['details'] = json_decode($row['details'] ?? '{}', true) ?: [];

json_ok($row);
