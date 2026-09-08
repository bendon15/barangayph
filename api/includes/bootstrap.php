<?php
/**
 * Included at the top of every api/*.php endpoint.
 * Starts the session, applies permissive-but-safe CORS for local
 * dev, and provides small helpers used throughout the API.
 */

declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');

// CORS: only needed if the frontend is served from a different
// origin than the API (e.g. testing the static /public folder with
// a separate dev server). Same-origin deployments don't need this.
$allowedOrigin = getenv('FRONTEND_ORIGIN') ?: '';
if ($allowedOrigin !== '') {
    header("Access-Control-Allow-Origin: {$allowedOrigin}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/../config/db.php';

function json_ok($data = null, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

function json_error(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'message' => $message]);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function current_resident_id(): ?string
{
    return $_SESSION['resident_id'] ?? null;
}

function current_admin(): ?array
{
    return $_SESSION['admin'] ?? null;
}

function require_resident(): string
{
    $id = current_resident_id();
    if (!$id) json_error('Please log in first.', 401);
    return $id;
}

function require_admin(): array
{
    $admin = current_admin();
    if (!$admin) json_error('Admin login required.', 401);
    return $admin;
}

function require_super_admin(): array
{
    $admin = require_admin();
    if (($admin['role'] ?? '') !== 'super_admin') {
        json_error('This action requires a super admin account.', 403);
    }
    return $admin;
}

function uuid_v4(): string
{
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function reference_no(): string
{
    return 'PH-' . date('Ym') . '-' . str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
}
