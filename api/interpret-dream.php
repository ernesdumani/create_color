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
$dreamText = $input['dreamText'] ?? '';

if (empty($dreamText)) {
    http_response_code(400);
    echo json_encode(['error' => 'Dream text is required']);
    exit;
}

// Check if we have a cached interpretation
$database = new Database();
$db = $database->getConnection();

$dreamHash = hash('sha256', $dreamText);
$stmt = $db->prepare("SELECT interpretation FROM dream_interpretations WHERE dream_hash = ?");
$stmt->execute([$dreamHash]);
$cached = $stmt->fetch(PDO::FETCH_ASSOC);

if ($cached) {
    $interpretation = json_decode($cached['interpretation'], true);
} else {
    // Call OpenAI API
    $interpretation = interpretDreamWithOpenAI($dreamText);
    
    if ($interpretation) {
        // Cache the interpretation
        $stmt = $db->prepare("INSERT INTO dream_interpretations (dream_hash, interpretation) VALUES (?, ?)");
        $stmt->execute([$dreamHash, json_encode($interpretation)]);
    }
}

if (!$interpretation) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to interpret dream']);
    exit;
}

// Generate color palette
$colors = generateColorPalette($interpretation);

// Save to database
$paletteData = [
    'dream_text' => $dreamText,
    'colors' => $colors,
    'emotions' => $interpretation['emotions'] ?? [],
    'symbols' => $interpretation['symbols'] ?? [],
    'mood' => $interpretation['overallMood'] ?? 'mysterious',
    'title' => 'Dream ' . date('M j, Y')
];

$stmt = $db->prepare("
    INSERT INTO dream_palettes (dream_text, colors, emotions, symbols, mood, title) 
    VALUES (?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $paletteData['dream_text'],
    json_encode($paletteData['colors']),
    json_encode($paletteData['emotions']),
    json_encode($paletteData['symbols']),
    $paletteData['mood'],
    $paletteData['title']
]);

echo json_encode($paletteData);

function interpretDreamWithOpenAI($dreamText) {
    $prompt = "Analyze this dream description and extract symbolic meanings, emotions, and suggest colors that would represent the dream's essence:

\"$dreamText\"

Focus on:
- Emotional undertones and feelings
- Symbolic elements (water, fire, animals, people, objects, etc.)
- Overall mood and atmosphere
- Colors that would capture the dream's essence
- Intensity of different elements

Respond with a JSON object containing:
- emotions: array of primary emotions
- symbols: array of objects with symbol, meaning, and intensity (0-1)
- overallMood: one of [peaceful, anxious, mysterious, joyful, melancholic, energetic, chaotic, serene]
- colorSuggestions: array of objects with color (hex) and reasoning";

    $data = [
        'model' => 'gpt-3.5-turbo',
        'messages' => [
            [
                'role' => 'system',
                'content' => 'You are a dream analyst and color psychologist. Respond only with valid JSON.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ],
        'max_tokens' => 1000,
        'temperature' => 0.7
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, OPENAI_API_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENAI_API_KEY
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return null;
    }

    $result = json_decode($response, true);
    $content = $result['choices'][0]['message']['content'] ?? '';
    
    return json_decode($content, true);
}

function generateColorPalette($interpretation) {
    $colors = [];
    
    // Color mappings
    $symbolColors = [
        'water' => ['#0077be', '#4a90e2', '#87ceeb', '#20b2aa'],
        'fire' => ['#ff4500', '#ff6347', '#ffa500', '#dc143c'],
        'sky' => ['#87ceeb', '#4169e1', '#6495ed', '#b0c4de'],
        'earth' => ['#8b4513', '#a0522d', '#daa520', '#cd853f'],
        'forest' => ['#228b22', '#32cd32', '#90ee90', '#006400'],
        'night' => ['#191970', '#483d8b', '#2f4f4f', '#000080'],
        'light' => ['#ffffe0', '#fffacd', '#f0e68c', '#ffd700'],
        'shadow' => ['#2f2f2f', '#696969', '#708090', '#4a4a4a']
    ];
    
    $moodColors = [
        'peaceful' => ['#e6f3ff', '#b3d9ff', '#87ceeb', '#4a90e2'],
        'anxious' => ['#ff6b6b', '#ffa07a', '#ff7f50', '#ff4500'],
        'mysterious' => ['#4b0082', '#663399', '#8a2be2', '#9370db'],
        'joyful' => ['#ffff00', '#ffd700', '#ffa500', '#ff69b4'],
        'melancholic' => ['#4682b4', '#5f9ea0', '#708090', '#2f4f4f'],
        'energetic' => ['#ff1493', '#ff4500', '#ffa500', '#32cd32'],
        'chaotic' => ['#ff0000', '#ff4500', '#8b008b', '#4b0082'],
        'serene' => ['#e0ffff', '#f0f8ff', '#e6e6fa', '#d8bfd8']
    ];
    
    // Add colors from AI suggestions
    if (isset($interpretation['colorSuggestions'])) {
        foreach ($interpretation['colorSuggestions'] as $suggestion) {
            $colors[] = $suggestion['color'];
        }
    }
    
    // Add mood colors
    $mood = $interpretation['overallMood'] ?? 'mysterious';
    if (isset($moodColors[$mood])) {
        $colors = array_merge($colors, array_slice($moodColors[$mood], 0, 2));
    }
    
    // Add symbol colors
    if (isset($interpretation['symbols'])) {
        foreach ($interpretation['symbols'] as $symbol) {
            $symbolName = strtolower($symbol['symbol']);
            if (isset($symbolColors[$symbolName])) {
                $intensity = $symbol['intensity'] ?? 0.5;
                $numColors = max(1, round($intensity * 2));
                $colors = array_merge($colors, array_slice($symbolColors[$symbolName], 0, $numColors));
            }
        }
    }
    
    // Ensure we have at least 5 colors and at most 8
    $colors = array_unique($colors);
    if (count($colors) < 5) {
        $colors = array_merge($colors, ['#e6e6fa', '#f0f8ff', '#ffe4e1', '#f5f5dc', '#e0ffff']);
    }
    
    return array_slice(array_values($colors), 0, 8);
}
?>
