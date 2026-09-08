<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
require_admin();

$body = read_json_body();
$fullName = trim($body['full_name'] ?? '');
$position = trim($body['position'] ?? '');
$roleTitle = trim($body['role_title'] ?? '');
$validPositions = ['chairman', 'kagawad', 'sk_chairman', 'sk_kagawad', 'secretary', 'treasurer', 'tanod'];

if ($fullName === '' || !in_array($position, $validPositions, true) || $roleTitle === '') {
    json_error('Full name, a valid position, and role title are required.');
}

$committee = trim($body['committee'] ?? '');
$term = trim($body['term'] ?? '');
$order = (int) ($body['display_order'] ?? 1);

if (!empty($body['id'])) {
    $stmt = $pdo->prepare('UPDATE officials SET full_name=?, position=?, role_title=?, committee=?, term=?, display_order=? WHERE id=?');
    $stmt->execute([$fullName, $position, $roleTitle, $committee, $term, $order, $body['id']]);
} else {
    $id = uuid_v4();
    $stmt = $pdo->prepare('INSERT INTO officials (id, full_name, position, role_title, committee, term, display_order) VALUES (?,?,?,?,?,?,?)');
    $stmt->execute([$id, $fullName, $position, $roleTitle, $committee, $term, $order]);
}

json_ok(['success' => true]);
