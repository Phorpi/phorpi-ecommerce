<?php
/**
 * Phorpi E-Ticaret — Teklif Formu Alıcısı
 * ---------------------------------------
 * KURULUM:
 *   1) $TO_EMAIL değerini alıcı adrese ayarla.
 *   2) $FROM_EMAIL sunucuda tanımlı bir e-postaya işaret etsin
 *      (aksi halde çoğu hosting mail() çağrısını reddeder).
 *   3) İstersen SUBJECT_PREFIX'i değiştir.
 *
 * Yanıt: her zaman JSON. Başarılı → {"ok": true}, hata → {"ok": false, "error": "..."}
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

/* ================= AYARLAR ================= */
$TO_EMAIL       = 'info@phorpi.com';
$FROM_EMAIL     = 'no-reply@phorpi.com';
$FROM_NAME      = 'Phorpi Web';
$SUBJECT_PREFIX = '[Phorpi Teklif]';
/* =========================================== */

function fail(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean(string $s, int $max = 500): string {
    $s = trim($s);
    $s = preg_replace('/[\r\n]+/', ' ', $s);
    $s = mb_substr($s, 0, $max);
    return $s;
}

function cleanBlock(string $s, int $max = 3000): string {
    $s = trim($s);
    $s = str_replace(["\r\n", "\r"], "\n", $s);
    $s = mb_substr($s, 0, $max);
    return $s;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Method not allowed', 405);
}

/* Honeypot */
if (!empty($_POST['honeypot'])) {
    echo json_encode(['ok' => true]);
    exit;
}

/* KVKK zorunlu */
if (empty($_POST['kvkk'])) {
    fail('KVKK onayı gereklidir.');
}

/* Alanları topla */
$name     = clean((string)($_POST['name']     ?? ''), 120);
$company  = clean((string)($_POST['company']  ?? ''), 160);
$email    = clean((string)($_POST['email']    ?? ''), 160);
$phone    = clean((string)($_POST['phone']    ?? ''), 60);
$category = clean((string)($_POST['category'] ?? ''), 200);
$status   = clean((string)($_POST['status']   ?? ''), 40);
$lang     = clean((string)($_POST['lang']     ?? 'tr'), 6);
$message  = cleanBlock((string)($_POST['message'] ?? ''), 3000);

$markets  = isset($_POST['markets'])  && is_array($_POST['markets'])  ? array_map('strval', $_POST['markets'])  : [];
$services = isset($_POST['services']) && is_array($_POST['services']) ? array_map('strval', $_POST['services']) : [];
$markets  = array_slice(array_map(fn($v) => clean($v, 60), $markets),  0, 20);
$services = array_slice(array_map(fn($v) => clean($v, 60), $services), 0, 20);

/* Doğrulama */
if ($name === '')                                fail('Ad soyad zorunludur.');
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Geçerli bir e-posta zorunludur.');

/* Konu */
$subject = $SUBJECT_PREFIX . ' ' . ($company !== '' ? $company : $name);

/* Gövde */
$lines = [];
$lines[] = 'Yeni teklif talebi';
$lines[] = str_repeat('-', 40);
$lines[] = 'Dil          : ' . $lang;
$lines[] = 'Ad Soyad     : ' . $name;
$lines[] = 'Sirket       : ' . $company;
$lines[] = 'E-posta      : ' . $email;
$lines[] = 'Telefon      : ' . $phone;
$lines[] = 'Kategori     : ' . $category;
$lines[] = 'Hedef Pazar  : ' . implode(', ', $markets);
$lines[] = 'Hizmetler    : ' . implode(', ', $services);
$lines[] = 'Mevcut Durum : ' . $status;
$lines[] = str_repeat('-', 40);
$lines[] = 'Aciklama:';
$lines[] = $message;
$lines[] = str_repeat('-', 40);
$lines[] = 'IP           : ' . ($_SERVER['REMOTE_ADDR'] ?? '-');
$lines[] = 'Tarih        : ' . date('Y-m-d H:i:s');

$body = implode("\n", $lines);

/* Header'lar — güvenli enjeksiyon önlemi ile */
$safeFromName = preg_replace('/[\r\n]/', '', $FROM_NAME);
$headers = [];
$headers[] = 'From: ' . mb_encode_mimeheader($safeFromName) . ' <' . $FROM_EMAIL . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$sent = @mail($TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    fail('Mesaj gonderilemedi.', 500);
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
