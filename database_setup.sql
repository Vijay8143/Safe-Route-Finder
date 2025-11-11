-- Safe Route Navigator Database Setup Script
-- Run this script in MySQL Workbench to create the complete database

-- Create and use the database
CREATE DATABASE IF NOT EXISTS safe_route_navigator;
USE safe_route_navigator;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS live_locations;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS crimes;
DROP TABLE IF EXISTS users;

-- Create Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  emergency_contact VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Crimes table
CREATE TABLE crimes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  category ENUM('theft', 'robbery', 'assault', 'harassment', 'vandalism', 'other') NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  incident_date TIMESTAMP NOT NULL,
  reported_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_location (lat, lng),
  INDEX idx_incident_date (incident_date),
  INDEX idx_severity (severity)
);

-- Create Ratings table
CREATE TABLE ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  safety_score INT NOT NULL CHECK (safety_score >= 1 AND safety_score <= 5),
  comment TEXT,
  time_of_day ENUM('morning', 'afternoon', 'evening', 'night') NOT NULL,
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  route_type ENUM('walking', 'cycling', 'driving') DEFAULT 'walking',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_location (lat, lng),
  INDEX idx_safety_score (safety_score),
  INDEX idx_time_of_day (time_of_day)
);

-- Create Live Locations table
CREATE TABLE live_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  share_id VARCHAR(36) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  message TEXT,
  sharer_name VARCHAR(255),
  accuracy DECIMAL(8, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_share_id (share_id),
  INDEX idx_expires_at (expires_at)
);

-- Insert sample data

-- Sample Users (password is bcrypt hash of "Demo123!")
INSERT INTO users (email, password_hash, name, phone, emergency_contact) VALUES 
('demo@saferoute.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewfc0A7Uq1FHQ/4a', 'Demo User', '+1234567890', 'emergency@saferoute.com'),
('jane@saferoute.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewfc0A7Uq1FHQ/4a', 'Jane Smith', '+1987654321', 'jane.emergency@saferoute.com'),
('sarah@saferoute.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lewfc0A7Uq1FHQ/4a', 'Sarah Johnson', '+1555123456', 'sarah.emergency@saferoute.com');

-- Sample Crime Data (New York City area)
INSERT INTO crimes (lat, lng, category, description, severity, incident_date, reported_by) VALUES 
-- Times Square area
(40.7589, -73.9851, 'theft', 'Purse snatching incident reported near Times Square during evening hours', 'medium', DATE_SUB(NOW(), INTERVAL 2 DAY), 1),
(40.7580, -73.9855, 'harassment', 'Verbal harassment reported on busy street corner', 'low', DATE_SUB(NOW(), INTERVAL 5 DAY), 2),

-- Central Park area
(40.7614, -73.9776, 'assault', 'Physical altercation reported in Central Park area during night', 'high', DATE_SUB(NOW(), INTERVAL 1 DAY), 1),
(40.7620, -73.9780, 'theft', 'Bicycle theft reported near park entrance', 'medium', DATE_SUB(NOW(), INTERVAL 3 DAY), 3),

-- Financial District
(40.7282, -74.0776, 'robbery', 'Armed robbery reported near financial district late at night', 'critical', DATE_SUB(NOW(), INTERVAL 3 DAY), 2),
(40.7290, -74.0780, 'vandalism', 'Property damage reported in financial area', 'low', DATE_SUB(NOW(), INTERVAL 6 DAY), 1),

-- Brooklyn Bridge area
(40.7061, -73.9969, 'harassment', 'Inappropriate behavior reported near Brooklyn Bridge', 'medium', DATE_SUB(NOW(), INTERVAL 4 DAY), 3),

-- Greenwich Village
(40.7341, -74.0013, 'theft', 'Phone theft reported in Greenwich Village cafe', 'medium', DATE_SUB(NOW(), INTERVAL 7 DAY), 2),

-- Union Square
(40.7359, -73.9911, 'assault', 'Incident reported in Union Square area', 'high', DATE_SUB(NOW(), INTERVAL 2 DAY), 1),

-- Chelsea area
(40.7465, -74.0014, 'other', 'Suspicious activity reported in Chelsea neighborhood', 'low', DATE_SUB(NOW(), INTERVAL 8 DAY), 3);

-- Sample Safety Ratings
INSERT INTO ratings (user_id, lat, lng, safety_score, comment, time_of_day, day_of_week, route_type) VALUES 
-- Times Square ratings
(1, 40.7589, -73.9851, 3, 'Busy area during day, feels safe but crowded. Good lighting and police presence.', 'afternoon', 'wednesday', 'walking'),
(2, 40.7589, -73.9851, 2, 'Too crowded and chaotic at night, avoid if possible.', 'night', 'friday', 'walking'),

-- Central Park ratings  
(1, 40.7614, -73.9776, 4, 'Central Park is well-lit and patrolled during daytime. Great for morning jogs.', 'morning', 'saturday', 'walking'),
(3, 40.7614, -73.9776, 2, 'Not safe at night, poorly lit areas and fewer people around.', 'night', 'sunday', 'walking'),

-- Financial District ratings
(2, 40.7282, -74.0776, 3, 'Business district feels safe during work hours, dead at night.', 'afternoon', 'tuesday', 'walking'),
(1, 40.7282, -74.0776, 1, 'Very unsafe at night, deserted streets and poor lighting.', 'night', 'friday', 'walking'),

-- Brooklyn Bridge area
(3, 40.7061, -73.9969, 4, 'Beautiful walk during the day, lots of tourists and good vibes.', 'afternoon', 'saturday', 'walking'),
(2, 40.7061, -73.9969, 3, 'Evening walks are nice but stay aware of surroundings.', 'evening', 'friday', 'walking'),

-- Greenwich Village
(1, 40.7341, -74.0013, 5, 'Love this neighborhood! Well-lit streets, friendly people, feels very safe.', 'evening', 'thursday', 'walking'),
(3, 40.7341, -74.0013, 4, 'Great area for walking, lots of cafes and people around.', 'afternoon', 'sunday', 'walking'),

-- Union Square
(2, 40.7359, -73.9911, 3, 'Busy area with good transportation links, generally safe during day.', 'morning', 'monday', 'walking'),
(1, 40.7359, -73.9911, 2, 'Can get sketchy late at night, especially on weekends.', 'night', 'saturday', 'walking');

-- Sample Live Locations (for demonstration)
INSERT INTO live_locations (share_id, user_id, lat, lng, expires_at, is_active, message, sharer_name, accuracy) VALUES 
('demo-share-123', 1, 40.7589, -73.9851, DATE_ADD(NOW(), INTERVAL 2 HOUR), TRUE, 'Walking to dinner, will update location every 5 minutes', 'Demo User', 15.5),
('demo-share-456', 2, 40.7614, -73.9776, DATE_ADD(NOW(), INTERVAL 1 HOUR), TRUE, 'Jogging in Central Park', 'Jane Smith', 8.2);

-- Verify the setup
SELECT 'Database setup completed!' as Status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as crime_count FROM crimes;
SELECT COUNT(*) as rating_count FROM ratings;
SELECT COUNT(*) as live_location_count FROM live_locations;

-- Show sample data
SELECT 'Sample Users:' as Info;
SELECT id, email, name, phone FROM users LIMIT 3;

SELECT 'Sample Crimes:' as Info;
SELECT id, category, severity, description, lat, lng, incident_date FROM crimes LIMIT 5;

SELECT 'Sample Ratings:' as Info;
SELECT id, safety_score, comment, time_of_day, lat, lng FROM ratings LIMIT 5;