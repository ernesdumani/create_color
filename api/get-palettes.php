<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$stmt = $db->prepare("SELECT * FROM dream_palettes ORDER BY created_at DESC LIMIT 50");
$stmt->execute();
$palettes = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($palettes);
?>
