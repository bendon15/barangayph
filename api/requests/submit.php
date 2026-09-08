<?php
require __DIR__ . '/../includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);
$residentId = require_resident();

$b = read_json_body();
$serviceType = $b['service_type'] ?? '';
$validTypes = [
    'barangay_clearance', 'residency_certificate', 'indigency_certificate',
    'business_clearance', 'blotter_report', 'complaint', 'pet_registration',
];
if (!in_array($serviceType, $validTypes, true)) json_error('Invalid service type.');

$purpose = trim($b['purpose'] ?? '');
$details = $b['details'] ?? [];

$id = uuid_v4();
$ref = reference_no();

$stmt = $pdo->prepare(
    'INSERT INTO service_requests (id, reference_no, resident_id, service_type, purpose, details, status, requested_at, updated_at)
     VALUES (?,?,?,?,?,?,\'pending\',NOW(),NOW())'
);
$stmt->execute([$id, $ref, $residentId, $serviceType, $purpose, json_encode($details)]);

// Pet registration also gets a dedicated record for vaccination tracking.
if ($serviceType === 'pet_registration' && !empty($details['pet_name'])) {
    $petStmt = $pdo->prepare(
        'INSERT INTO pets (id, resident_id, request_id, pet_name, species, breed, color, sex, vaccination_date, registered_at)
         VALUES (?,?,?,?,?,?,?,?,?,NOW())'
    );
    $petStmt->execute([
        uuid_v4(), $residentId, $id,
        $details['pet_name'] ?? '', $details['species'] ?? '', $details['breed'] ?? '',
        $details['pet_color'] ?? '', $details['pet_sex'] ?? '', $details['vaccination_date'] ?? null,
    ]);
}

json_ok(['id' => $id, 'reference_no' => $ref], 201);
