-- Create database
CREATE DATABASE IF NOT EXISTS lucidhue;
USE lucidhue;

-- Create dream_palettes table
CREATE TABLE dream_palettes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dream_text TEXT NOT NULL,
    colors JSON NOT NULL,
    emotions JSON,
    symbols JSON,
    mood VARCHAR(50),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dream_interpretations table for caching
CREATE TABLE dream_interpretations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dream_hash VARCHAR(64) UNIQUE,
    interpretation JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO dream_palettes (dream_text, colors, emotions, symbols, mood, title) VALUES
(
    'I dreamed of floating in a cosmic ocean with stars reflecting in the water',
    '["#0077be", "#4a90e2", "#ffd700", "#e6e6fa", "#191970"]',
    '["peaceful", "mysterious", "wonder"]',
    '[{"symbol": "water", "meaning": "emotions and subconscious", "intensity": 0.8}, {"symbol": "stars", "meaning": "hopes and dreams", "intensity": 0.9}]',
    'serene',
    'Cosmic Ocean Dream'
);
