<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
$admin = require_admin();

$body = read_json_body();
$title = trim($body['title'] ?? '');
$bodyText = trim($body['body'] ?? '');
$category = trim($body['category'] ?? 'announcement');
$validCategories = ['announcement', 'program', 'advisory', 'event'];
if ($title === '' || $bodyText === '' || !in_array($category, $validCategories, true)) {
    json_error('Title, body, and a valid category are required.');
}
$isPinned = !empty($body['is_pinned']) ? 1 : 0;

if (!empty($body['id'])) {
    $stmt = $pdo->prepare('UPDATE announcements SET title=?, body=?, category=?, is_pinned=? WHERE id=?');
    $stmt->execute([$title, $bodyText, $category, $isPinned, $body['id']]);
} else {
    $id = uuid_v4();
    $stmt = $pdo->prepare('INSERT INTO announcements (id, title, body, category, is_pinned, published_at, created_by) VALUES (?,?,?,?,?,NOW(),?)');
    $stmt->execute([$id, $title, $bodyText, $category, $isPinned, $admin['id']]);
}

json_ok(['success' => true]);
