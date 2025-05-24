<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? '';

if (empty($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID is required']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

$stmt = $db->prepare("DELETE FROM dream_palettes WHERE id = ?");
$result = $stmt->execute([$id]);

if ($result) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete palette']);
}
?>
