<?php
/**
 * Database connection (PDO / MySQL).
 *
 * Local development (Laragon/XAMPP): the defaults below match a
 * freshly imported database/schema.sql on a stock MySQL install.
 *
 * Production (Hostinger or any shared host): set these as actual
 * environment variables in your hosting control panel, or simply
 * edit the fallback values below before uploading. Never commit
 * real production credentials to a public GitHub repo.
 */

$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'barangay_portal';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'message' => 'Database connection failed. Check api/config/db.php and confirm the schema has been imported.',
    ]);
    exit;
}
