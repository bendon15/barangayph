<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
require_admin();

$body = read_json_body();
if (empty($body['id'])) json_error('Missing announcement id.');

$stmt = $pdo->prepare('DELETE FROM announcements WHERE id = ?');
$stmt->execute([$body['id']]);

json_ok(['success' => true]);
