<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$id = $_GET['id'] ?? '';

if (empty($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$stmt = $db->prepare("SELECT * FROM dream_palettes WHERE id = ?");
$stmt->execute([$id]);
$palette = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$palette) {
    http_response_code(404);
    echo json_encode(['error' => 'Palette not found']);
    exit;
}

// Format for export
$exportData = [
    'title' => $palette['title'],
    'dreamText' => $palette['dream_text'],
    'colors' => json_decode($palette['colors']),
    'emotions' => json_decode($palette['emotions']),
    'symbols' => json_decode($palette['symbols']),
    'mood' => $palette['mood'],
    'createdAt' => $palette['created_at']
];

echo json_encode($exportData, JSON_PRETTY_PRINT);
?>
