/**
 * demo-data.js
 * -------------------------------------------------------------
 * A localStorage-backed stand-in for the PHP + MySQL backend so
 * this portfolio build runs fully client-side on static hosts
 * like GitHub Pages / Vercel, where PHP does not execute.
 *
 * Every function here mirrors the shape of a real api/*.php
 * response (see database/schema.sql and the api/ folder). When
 * this project is deployed to a PHP-capable host, api-client.js
 * talks to the real endpoints instead and this file is never
 * touched — it is a fallback, not the source of truth.
 * -------------------------------------------------------------
 */
(function (global) {
  const KEYS = {
    info: 'brgy_info',
    officials: 'brgy_officials',
    announcements: 'brgy_announcements',
    residents: 'brgy_residents',
    admins: 'brgy_admins',
    requests: 'brgy_requests',
    session: 'brgy_session',
    seeded: 'brgy_seeded_v1',
  };

  const SERVICE_TYPES = {
    barangay_clearance: { label: 'Barangay Clearance', fee: 50, needsPurpose: true },
    residency_certificate: { label: 'Certificate of Residency', fee: 40, needsPurpose: true },
    indigency_certificate: { label: 'Certificate of Indigency', fee: 0, needsPurpose: true },
    business_clearance: { label: 'Barangay Business Clearance', fee: 150, needsPurpose: false, extra: ['business_name', 'business_address', 'business_type'] },
    blotter_report: { label: 'Blotter Report', fee: 0, needsPurpose: false, extra: ['incident_date', 'incident_location', 'parties_involved', 'narrative'] },
    complaint: { label: 'Complaint', fee: 0, needsPurpose: false, extra: ['against_whom', 'narrative'] },
    pet_registration: { label: 'Pet Registration / Vaccination', fee: 25, needsPurpose: false, extra: ['pet_name', 'species', 'breed', 'pet_color', 'pet_sex', 'vaccination_date'] },
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function uid(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 9); }
  function nowIso() { return new Date().toISOString(); }
  function refNo() {
    const d = new Date();
    return `BM-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function seed() {
    if (read(KEYS.seeded, false)) return;

    write(KEYS.info, {
      barangay_name: 'Barangay PH',
      city_municipality: 'Sta. Mesa',
      province: 'Metro Manila',
      address: 'Purok 3, Barangay PH, Sta. Mesa, Metro Manila 1108',
      contact_number: '(02) 8123 4567',
      email: 'info@barangayph.gov.ph',
      office_hours: 'Monday – Friday, 8:00 AM – 5:00 PM',
      mission: 'To deliver transparent, responsive, and dignified public service to every resident of Barangay PH.',
      vision: 'A peaceful, progressive, and united barangay where every family thrives in safety and opportunity.',
      founded_year: 1978,
      household_count: 2140,
      population: 9860,
      purok_count: 8,
    });

    write(KEYS.officials, [
      { id: uid('off'), full_name: 'Hon. Ramon D. Villareal', position: 'chairman', role_title: 'Punong Barangay', committee: 'Peace & Order, Executive', term: '2023 – 2026', display_order: 1, photo_seed: 'chairman' },
      { id: uid('off'), full_name: 'Hon. Corazon P. Ibañez', position: 'kagawad', role_title: 'Barangay Kagawad', committee: 'Health & Sanitation', term: '2023 – 2026', display_order: 1, photo_seed: 'k1' },
      { id: uid('off'), full_name: 'Hon. Danilo S. Reyes', position: 'kagawad', role_title: 'Barangay Kagawad', committee: 'Peace & Order', term: '2023 – 2026', display_order: 2, photo_seed: 'k2' },
      { id: uid('off'), full_name: 'Hon. Marites A. Cruz', position: 'kagawad', role_title: 'Barangay Kagawad', committee: 'Women & Family', term: '2023 – 2026', display_order: 3, photo_seed: 'k3' },
      { id: uid('off'), full_name: 'Hon. Ferdinand L. Santos', position: 'kagawad', role_title: 'Barangay Kagawad', committee: 'Infrastructure', term: '2023 – 2026', display_order: 4, photo_seed: 'k4' },
      { id: uid('off'), full_name: 'Hon. Leonora M. Bautista', position: 'kagawad', role_title: 'Barangay Kagawad', committee: 'Education & Culture', term: '2023 – 2026', display_order: 5, photo_seed: 'k5' },
      { id: uid('off'), full_name: 'Hon. Arnel T. Domingo', position: 'kagawad', role_title: 'Barangay Kagawad', committee: 'Environment', term: '2023 – 2026', display_order: 6, photo_seed: 'k6' },
      { id: uid('off'), full_name: 'Hon. Josefina R. Aquino', position: 'kagawad', role_title: 'Barangay Kagawad', committee: 'Livelihood & Cooperatives', term: '2023 – 2026', display_order: 7, photo_seed: 'k7' },
      { id: uid('off'), full_name: 'Kim R. Villareal', position: 'sk_chairman', role_title: 'SK Chairperson', committee: 'Sangguniang Kabataan', term: '2023 – 2026', display_order: 1, photo_seed: 'sk1' },
      { id: uid('off'), full_name: 'Angelo M. Fernandez', position: 'sk_kagawad', role_title: 'SK Kagawad', committee: 'Youth Sports', term: '2023 – 2026', display_order: 1, photo_seed: 'sk2' },
      { id: uid('off'), full_name: 'Bea C. Navarro', position: 'sk_kagawad', role_title: 'SK Kagawad', committee: 'Youth Education', term: '2023 – 2026', display_order: 2, photo_seed: 'sk3' },
      { id: uid('off'), full_name: 'Mark Anthony D. Lopez', position: 'sk_kagawad', role_title: 'SK Kagawad', committee: 'Youth Livelihood', term: '2023 – 2026', display_order: 3, photo_seed: 'sk4' },
      { id: uid('off'), full_name: 'Rosalinda F. Torres', position: 'secretary', role_title: 'Barangay Secretary', committee: 'Records & Administration', term: 'Appointed', display_order: 1, photo_seed: 'sec' },
      { id: uid('off'), full_name: 'Bienvenido G. Mercado', position: 'treasurer', role_title: 'Barangay Treasurer', committee: 'Finance', term: 'Appointed', display_order: 1, photo_seed: 'treas' },
      { id: uid('off'), full_name: 'Rodrigo A. Panganiban', position: 'tanod', role_title: 'Chief Tanod', committee: 'Barangay Peacekeeping Force', term: 'Appointed', display_order: 1, photo_seed: 't1' },
      { id: uid('off'), full_name: 'Ernesto V. Castillo', position: 'tanod', role_title: 'Barangay Tanod', committee: 'Barangay Peacekeeping Force', term: 'Appointed', display_order: 2, photo_seed: 't2' },
      { id: uid('off'), full_name: 'Willy C. Ramos', position: 'tanod', role_title: 'Barangay Tanod', committee: 'Barangay Peacekeeping Force', term: 'Appointed', display_order: 3, photo_seed: 't3' },
      { id: uid('off'), full_name: 'Nestor P. Gutierrez', position: 'tanod', role_title: 'Barangay Tanod', committee: 'Barangay Peacekeeping Force', term: 'Appointed', display_order: 4, photo_seed: 't4' },
    ]);

    const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
    write(KEYS.announcements, [
      { id: uid('ann'), title: 'Free Anti-Rabies Vaccination for Pets', body: 'The Barangay Health Center, in partnership with the City Veterinary Office, will hold a free anti-rabies vaccination drive for dogs and cats. Bring your pet on a leash or in a carrier and present a valid ID.', category: 'program', is_pinned: true, published_at: daysAgo(2) },
      { id: uid('ann'), title: 'Barangay Assembly & Budget Consultation', body: 'All household heads are invited to the quarterly Barangay Assembly to review the proposed annual budget and raise community concerns. Attendance slips will be issued for those requesting certificates this month.', category: 'announcement', is_pinned: true, published_at: daysAgo(4) },
      { id: uid('ann'), title: 'Feeding Program for Malnourished Children', body: 'The Barangay Nutrition Committee is enrolling children identified as underweight in the 120-day supplemental feeding program. Parents may register at the Health Center from Monday to Friday.', category: 'program', is_pinned: false, published_at: daysAgo(7) },
      { id: uid('ann'), title: 'Road Clearing Operation on Purok 5', body: 'A road clearing and drainage desilting operation will be conducted along Purok 5 main road. Residents are asked to temporarily move vehicles and stalls obstructing the roadside.', category: 'advisory', is_pinned: false, published_at: daysAgo(10) },
      { id: uid('ann'), title: 'Solo Parent ID Renewal Schedule', body: 'The Barangay Social Welfare Desk will accept Solo Parent ID renewal applications every Wednesday this month. Bring your expiring ID and proof of income.', category: 'announcement', is_pinned: false, published_at: daysAgo(14) },
      { id: uid('ann'), title: 'Basketball League Opening – Liga ng Barangay PH', body: 'The SK Council formally opens this year\'s inter-purok basketball league. Team managers must complete roster submission at the SK office before the opening game.', category: 'event', is_pinned: false, published_at: daysAgo(18) },
    ]);

    write(KEYS.residents, [
      {
        id: uid('res'), first_name: 'Juan', middle_name: 'Santos', last_name: 'Dela Cruz', suffix: '',
        birthdate: '1990-04-12', gender: 'Male', civil_status: 'Married', purok: 'Purok 3',
        address: '123 Sampaguita St., Purok 3, Barangay PH', contact_number: '0917 123 4567',
        email: 'resident@demo.ph', password: 'resident123', is_verified: true, created_at: daysAgo(60),
      },
    ]);

    write(KEYS.admins, [
      { id: uid('adm'), username: 'admin', full_name: 'Rosalinda F. Torres', password: 'admin123', role: 'super_admin' },
      { id: uid('adm'), username: 'staff', full_name: 'Front Desk Staff', password: 'staff123', role: 'staff' },
    ]);

    const residentId = read(KEYS.residents, [])[0].id;
    write(KEYS.requests, [
      { id: uid('req'), reference_no: refNo(), resident_id: residentId, service_type: 'barangay_clearance', purpose: 'Job application requirement', details: {}, status: 'ready_for_pickup', admin_notes: 'Ready for claiming at the front desk.', requested_at: daysAgo(5), updated_at: daysAgo(1) },
      { id: uid('req'), reference_no: refNo(), resident_id: residentId, service_type: 'residency_certificate', purpose: 'School enrollment requirement', details: {}, status: 'processing', admin_notes: '', requested_at: daysAgo(2), updated_at: daysAgo(1) },
      { id: uid('req'), reference_no: refNo(), resident_id: residentId, service_type: 'pet_registration', purpose: '', details: { pet_name: 'Bantay', species: 'Dog', breed: 'Aspin', pet_color: 'Brown', pet_sex: 'Male', vaccination_date: daysAgo(30).slice(0, 10) }, status: 'pending', admin_notes: '', requested_at: daysAgo(1), updated_at: daysAgo(1) },
    ]);

    write(KEYS.seeded, true);
  }

  function getSession() { return read(KEYS.session, null); }
  function setSession(s) { write(KEYS.session, s); }
  function clearSession() { localStorage.removeItem(KEYS.session); }

  global.DemoDB = {
    KEYS, SERVICE_TYPES, uid, nowIso, refNo, seed,
    read, write, getSession, setSession, clearSession,
  };
})(window);
