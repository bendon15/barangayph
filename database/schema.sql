-- =========================================================
--  Barangay PH Portal — MySQL Schema + Sample Data
-- =========================================================
--  Import this file into a fresh MySQL/MariaDB database
--  (utf8mb4). See README.md for step-by-step setup on
--  Laragon/XAMPP (local) and Hostinger (production).
--
--  Demo login credentials (also documented in README.md):
--    Resident : resident@demo.ph / resident123
--    Admin    : admin / admin123          (super_admin)
--    Staff    : staff / staff123          (staff)
-- =========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- barangay_info — singleton table describing the barangay
-- ---------------------------------------------------------
DROP TABLE IF EXISTS barangay_info;
CREATE TABLE barangay_info (
    id                 INT PRIMARY KEY AUTO_INCREMENT,
    barangay_name      VARCHAR(150) NOT NULL,
    city_municipality  VARCHAR(150) NOT NULL,
    province           VARCHAR(150) NOT NULL,
    address            VARCHAR(255) NOT NULL,
    contact_number     VARCHAR(50)  DEFAULT NULL,
    email              VARCHAR(150) DEFAULT NULL,
    office_hours       VARCHAR(150) DEFAULT NULL,
    mission            TEXT         DEFAULT NULL,
    vision             TEXT         DEFAULT NULL,
    founded_year       SMALLINT     DEFAULT NULL,
    household_count    INT          DEFAULT 0,
    population         INT          DEFAULT 0,
    purok_count        INT          DEFAULT 0,
    logo_path          VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO barangay_info
    (barangay_name, city_municipality, province, address, contact_number, email, office_hours, mission, vision, founded_year, household_count, population, purok_count)
VALUES
    ('Barangay PH', 'Concepcion', 'Metro Manila',
     'Purok 3, Barangay PH, Concepcion, Metro Manila 1108',
     '(02) 8123 4567', 'info@barangayph.gov.ph', 'Monday – Friday, 8:00 AM – 5:00 PM',
     'To deliver transparent, responsive, and dignified public service to every resident of Barangay PH.',
     'A peaceful, progressive, and united barangay where every family thrives in safety and opportunity.',
     1978, 2140, 9860, 8);

-- ---------------------------------------------------------
-- officials — chairman, kagawads, SK officials, tanods, staff
-- ---------------------------------------------------------
DROP TABLE IF EXISTS officials;
CREATE TABLE officials (
    id             CHAR(36) PRIMARY KEY,
    full_name      VARCHAR(150) NOT NULL,
    position       ENUM('chairman','kagawad','sk_chairman','sk_kagawad','secretary','treasurer','tanod') NOT NULL,
    role_title     VARCHAR(100) NOT NULL,
    committee      VARCHAR(150) DEFAULT NULL,
    term           VARCHAR(50)  DEFAULT NULL,
    photo_path     VARCHAR(255) DEFAULT NULL,
    display_order  INT NOT NULL DEFAULT 1,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO officials (id, full_name, position, role_title, committee, term, display_order) VALUES
(UUID(), 'Hon. Ramon D. Villareal',   'chairman',   'Punong Barangay', 'Peace & Order, Executive',    '2023 – 2026', 1),
(UUID(), 'Hon. Corazon P. Ibañez',    'kagawad',    'Barangay Kagawad', 'Health & Sanitation',        '2023 – 2026', 1),
(UUID(), 'Hon. Danilo S. Reyes',      'kagawad',    'Barangay Kagawad', 'Peace & Order',              '2023 – 2026', 2),
(UUID(), 'Hon. Marites A. Cruz',      'kagawad',    'Barangay Kagawad', 'Women & Family',             '2023 – 2026', 3),
(UUID(), 'Hon. Ferdinand L. Santos',  'kagawad',    'Barangay Kagawad', 'Infrastructure',             '2023 – 2026', 4),
(UUID(), 'Hon. Leonora M. Bautista',  'kagawad',    'Barangay Kagawad', 'Education & Culture',        '2023 – 2026', 5),
(UUID(), 'Hon. Arnel T. Domingo',     'kagawad',    'Barangay Kagawad', 'Environment',                '2023 – 2026', 6),
(UUID(), 'Hon. Josefina R. Aquino',   'kagawad',    'Barangay Kagawad', 'Livelihood & Cooperatives',  '2023 – 2026', 7),
(UUID(), 'Kim R. Villareal',          'sk_chairman','SK Chairperson',   'Sangguniang Kabataan',       '2023 – 2026', 1),
(UUID(), 'Angelo M. Fernandez',       'sk_kagawad', 'SK Kagawad',       'Youth Sports',               '2023 – 2026', 1),
(UUID(), 'Bea C. Navarro',            'sk_kagawad', 'SK Kagawad',       'Youth Education',            '2023 – 2026', 2),
(UUID(), 'Mark Anthony D. Lopez',     'sk_kagawad', 'SK Kagawad',       'Youth Livelihood',           '2023 – 2026', 3),
(UUID(), 'Rosalinda F. Torres',       'secretary',  'Barangay Secretary','Records & Administration',  'Appointed',   1),
(UUID(), 'Bienvenido G. Mercado',     'treasurer',  'Barangay Treasurer','Finance',                   'Appointed',   1),
(UUID(), 'Rodrigo A. Panganiban',     'tanod',      'Chief Tanod',      'Barangay Peacekeeping Force','Appointed',   1),
(UUID(), 'Ernesto V. Castillo',       'tanod',      'Barangay Tanod',   'Barangay Peacekeeping Force','Appointed',   2),
(UUID(), 'Willy C. Ramos',            'tanod',      'Barangay Tanod',   'Barangay Peacekeeping Force','Appointed',   3),
(UUID(), 'Nestor P. Gutierrez',       'tanod',      'Barangay Tanod',   'Barangay Peacekeeping Force','Appointed',   4);

-- ---------------------------------------------------------
-- announcements — homepage announcements / ongoing programs
-- ---------------------------------------------------------
DROP TABLE IF EXISTS announcements;
CREATE TABLE announcements (
    id            CHAR(36) PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    body          TEXT NOT NULL,
    category      ENUM('announcement','program','advisory','event') NOT NULL DEFAULT 'announcement',
    image_path    VARCHAR(255) DEFAULT NULL,
    is_pinned     TINYINT(1) NOT NULL DEFAULT 0,
    published_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by    CHAR(36) DEFAULT NULL,
    INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO announcements (id, title, body, category, is_pinned, published_at) VALUES
(UUID(), 'Free Anti-Rabies Vaccination for Pets',
 'The Barangay Health Center, in partnership with the City Veterinary Office, will hold a free anti-rabies vaccination drive for dogs and cats. Bring your pet on a leash or in a carrier and present a valid ID.',
 'program', 1, NOW() - INTERVAL 2 DAY),
(UUID(), 'Barangay Assembly & Budget Consultation',
 'All household heads are invited to the quarterly Barangay Assembly to review the proposed annual budget and raise community concerns. Attendance slips will be issued for those requesting certificates this month.',
 'announcement', 1, NOW() - INTERVAL 4 DAY),
(UUID(), 'Feeding Program for Malnourished Children',
 'The Barangay Nutrition Committee is enrolling children identified as underweight in the 120-day supplemental feeding program. Parents may register at the Health Center from Monday to Friday.',
 'program', 0, NOW() - INTERVAL 7 DAY),
(UUID(), 'Road Clearing Operation on Purok 5',
 'A road clearing and drainage desilting operation will be conducted along Purok 5 main road. Residents are asked to temporarily move vehicles and stalls obstructing the roadside.',
 'advisory', 0, NOW() - INTERVAL 10 DAY),
(UUID(), 'Solo Parent ID Renewal Schedule',
 'The Barangay Social Welfare Desk will accept Solo Parent ID renewal applications every Wednesday this month. Bring your expiring ID and proof of income.',
 'announcement', 0, NOW() - INTERVAL 14 DAY),
(UUID(), 'Basketball League Opening – Liga ng Barangay PH',
 'The SK Council formally opens this year''s inter-purok basketball league. Team managers must complete roster submission at the SK office before the opening game.',
 'event', 0, NOW() - INTERVAL 18 DAY);

-- ---------------------------------------------------------
-- residents — resident accounts (portal login)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS residents;
CREATE TABLE residents (
    id              CHAR(36) PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100) DEFAULT NULL,
    last_name       VARCHAR(100) NOT NULL,
    suffix          VARCHAR(20)  DEFAULT NULL,
    birthdate       DATE NOT NULL,
    gender          ENUM('Male','Female') NOT NULL,
    civil_status    VARCHAR(30)  DEFAULT 'Single',
    purok           VARCHAR(50)  NOT NULL,
    address         VARCHAR(255) NOT NULL,
    contact_number  VARCHAR(30)  NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    valid_id_path   VARCHAR(255) DEFAULT NULL,
    is_verified     TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Demo password: resident123
INSERT INTO residents
    (id, first_name, middle_name, last_name, suffix, birthdate, gender, civil_status, purok, address, contact_number, email, password_hash, is_verified, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Juan', 'Santos', 'Dela Cruz', '', '1990-04-12', 'Male', 'Married',
     'Purok 3', '123 Sampaguita St., Purok 3, Barangay PH', '0917 123 4567', 'resident@demo.ph',
     '$2b$10$J6bZ7wMzgEdaMczhvoLIouMPwmD6ry84Job7jueu4EauRyVPt2P4C', 1, NOW() - INTERVAL 60 DAY);

-- ---------------------------------------------------------
-- admins — barangay secretariat / staff accounts
-- ---------------------------------------------------------
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    id             CHAR(36) PRIMARY KEY,
    username       VARCHAR(60) NOT NULL UNIQUE,
    full_name      VARCHAR(150) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('super_admin','staff') NOT NULL DEFAULT 'staff',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Demo passwords: admin123 / staff123
INSERT INTO admins (id, username, full_name, password_hash, role) VALUES
(UUID(), 'admin', 'Rosalinda F. Torres', '$2b$10$hLqlXr3CDnY0qmsy9qLuoeEgBFK.8XZ27DS37uqCWQ55tCZdeQfCK', 'super_admin'),
(UUID(), 'staff', 'Front Desk Staff',    '$2b$10$oYEEb9r8sTET1CNKvReJ8ONcxHmc10NAmPaVDTLOiTeDlHLiN/Waq', 'staff');

-- ---------------------------------------------------------
-- service_requests — one table for all 7 request types.
-- `details` holds type-specific fields as JSON (business info,
-- blotter narrative, pet info, etc.) so the schema stays lean
-- while still capturing every field the request forms collect.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS service_requests;
CREATE TABLE service_requests (
    id             CHAR(36) PRIMARY KEY,
    reference_no   VARCHAR(30) NOT NULL UNIQUE,
    resident_id    CHAR(36) NOT NULL,
    service_type   ENUM(
                     'barangay_clearance', 'residency_certificate', 'indigency_certificate',
                     'business_clearance', 'blotter_report', 'complaint', 'pet_registration'
                   ) NOT NULL,
    purpose        VARCHAR(255) DEFAULT NULL,
    details        JSON DEFAULT NULL,
    status         ENUM('pending','processing','approved','ready_for_pickup','released','rejected') NOT NULL DEFAULT 'pending',
    admin_notes    TEXT DEFAULT NULL,
    requested_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_resident FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
    INDEX idx_service_type (service_type),
    INDEX idx_status (status),
    INDEX idx_resident (resident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO service_requests (id, reference_no, resident_id, service_type, purpose, details, status, admin_notes, requested_at, updated_at) VALUES
(UUID(), CONCAT('PH-', DATE_FORMAT(NOW(), '%Y%m'), '-1001'), '11111111-1111-1111-1111-111111111111',
 'barangay_clearance', 'Job application requirement', JSON_OBJECT(),
 'ready_for_pickup', 'Ready for claiming at the front desk.', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 1 DAY),
(UUID(), CONCAT('PH-', DATE_FORMAT(NOW(), '%Y%m'), '-1002'), '11111111-1111-1111-1111-111111111111',
 'residency_certificate', 'School enrollment requirement', JSON_OBJECT(),
 'processing', '', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY),
(UUID(), CONCAT('PH-', DATE_FORMAT(NOW(), '%Y%m'), '-1003'), '11111111-1111-1111-1111-111111111111',
 'pet_registration', '', JSON_OBJECT('pet_name','Bantay','species','Dog','breed','Aspin','pet_color','Brown','pet_sex','Male','vaccination_date', DATE_FORMAT(NOW() - INTERVAL 30 DAY, '%Y-%m-%d')),
 'pending', '', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY);

-- ---------------------------------------------------------
-- pets — dedicated registry for pet_registration requests,
-- so vaccination records can be tracked/renewed over time
-- independently of the originating request.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS pets;
CREATE TABLE pets (
    id                CHAR(36) PRIMARY KEY,
    resident_id       CHAR(36) NOT NULL,
    request_id        CHAR(36) DEFAULT NULL,
    pet_name          VARCHAR(100) NOT NULL,
    species           VARCHAR(30)  DEFAULT NULL,
    breed             VARCHAR(100) DEFAULT NULL,
    color             VARCHAR(50)  DEFAULT NULL,
    sex               ENUM('Male','Female') DEFAULT NULL,
    vaccination_date  DATE DEFAULT NULL,
    next_due_date     DATE GENERATED ALWAYS AS (DATE_ADD(vaccination_date, INTERVAL 1 YEAR)) STORED,
    registered_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pet_resident FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT fk_pet_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
