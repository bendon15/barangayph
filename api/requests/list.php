<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
require_admin();

$service = $_GET['service_type'] ?? '';
$status = $_GET['status'] ?? '';

$sql = "SELECT r.*, CONCAT(res.first_name, ' ', res.last_name) AS resident_name, res.contact_number AS resident_contact
        FROM service_requests r
        JOIN residents res ON res.id = r.resident_id
        WHERE 1=1";
$params = [];

if ($service !== '') { $sql .= ' AND r.service_type = ?'; $params[] = $service; }
if ($status !== '') { $sql .= ' AND r.status = ?'; $params[] = $status; }

$sql .= ' ORDER BY r.requested_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

foreach ($rows as &$r) {
    $r['details'] = json_decode($r['details'] ?? '{}', true) ?: [];
}

json_ok($rows);
