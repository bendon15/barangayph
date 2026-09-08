<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

if ($admin = current_admin()) {
    json_ok(['type' => 'admin', 'id' => $admin['id'], 'name' => $admin['name'], 'role' => $admin['role']]);
}

if ($residentId = current_resident_id()) {
    $stmt = $pdo->prepare('SELECT id, first_name, last_name FROM residents WHERE id = ?');
    $stmt->execute([$residentId]);
    $resident = $stmt->fetch();
    if ($resident) {
        json_ok(['type' => 'resident', 'id' => $resident['id'], 'name' => $resident['first_name'] . ' ' . $resident['last_name']]);
    }
}

json_ok(null);
