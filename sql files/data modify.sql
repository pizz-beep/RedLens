-- Delete the extra high severity crimes we added
DELETE FROM CrimeRecord WHERE CrimeID > 50;

-- Add 30 MIXED severity crimes (Low, Medium, High)
INSERT INTO CrimeRecord (Type, CategoryID, Severity, Description, OccurredOn, OccurredTime, ReportedBy, VerifiedBy, VerifiedOn, LocationID, Status)
VALUES
-- Koramangala - Mixed
('Theft', 1, 'Low', 'Wallet pickpocketing', '2025-10-22', '14:30:00', 'PUB001', 'ADM001', CURRENT_TIMESTAMP, 2, 'Resolved'),
('Vandalism', 5, 'Low', 'Graffiti on wall', '2025-10-19', '11:15:00', 'PUB002', 'ADM001', CURRENT_TIMESTAMP, 2, 'Active'),
('Assault', 2, 'Medium', 'Bar argument', '2025-10-14', '23:00:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 2, 'Resolved'),
('Drug-related', 7, 'High', 'Drug dealing', '2025-10-07', '21:45:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 2, 'Active'),

-- Indiranagar - Mixed
('Theft', 1, 'Low', 'Bicycle stolen', '2025-10-16', '08:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 1, 'Resolved'),
('Fraud', 6, 'Medium', 'Online scam', '2025-10-09', '16:30:00', 'PUB007', 'ADM002', CURRENT_TIMESTAMP, 1, 'Active'),
('Robbery', 4, 'High', 'Jewelry theft', '2025-09-30', '20:00:00', 'PUB008', 'ADM001', CURRENT_TIMESTAMP, 1, 'Under Investigation'),
('Vandalism', 5, 'Low', 'Car scratch', '2025-10-21', '07:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 1, 'Resolved'),

-- BTM Layout - Mixed
('Theft', 1, 'Medium', 'Phone snatching', '2025-10-18', '19:00:00', 'PUB001', 'ADM002', CURRENT_TIMESTAMP, 5, 'Active'),
('Vandalism', 5, 'Low', 'Park bench damage', '2025-10-12', '10:00:00', 'PUB002', 'ADM001', CURRENT_TIMESTAMP, 5, 'Resolved'),
('Burglary', 3, 'High', 'House break-in', '2025-10-05', '03:00:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 5, 'Active'),
('Assault', 2, 'Medium', 'Street fight', '2025-09-29', '22:30:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 5, 'Resolved'),

-- Whitefield - Mixed
('Cyber Crime', 9, 'Medium', 'Email phishing', '2025-10-20', '11:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 4, 'Active'),
('Theft', 1, 'Low', 'Laptop bag stolen', '2025-10-13', '18:00:00', 'PUB007', 'ADM002', CURRENT_TIMESTAMP, 4, 'Resolved'),
('Fraud', 6, 'High', 'Investment scam', '2025-10-06', '15:00:00', 'PUB008', 'ADM001', CURRENT_TIMESTAMP, 4, 'Active'),
('Vandalism', 5, 'Low', 'Office graffiti', '2025-09-27', '09:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 4, 'Resolved'),

-- Electronic City - Mixed
('Robbery', 4, 'High', 'Armed robbery', '2025-10-24', '22:45:00', 'PUB001', 'ADM002', CURRENT_TIMESTAMP, 6, 'Active'),
('Theft', 1, 'Medium', 'Bike stolen', '2025-10-15', '07:00:00', 'PUB002', 'ADM001', CURRENT_TIMESTAMP, 6, 'Resolved'),
('Assault', 2, 'Medium', 'Workplace fight', '2025-10-08', '17:30:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 6, 'Active'),
('Vandalism', 5, 'Low', 'Bus stop damage', '2025-09-26', '12:00:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 6, 'Resolved'),

-- Marathahalli - Mixed
('Theft', 1, 'Low', 'Wallet stolen at mall', '2025-10-23', '14:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 10, 'Resolved'),
('Fraud', 6, 'Medium', 'Credit card fraud', '2025-10-14', '10:00:00', 'PUB007', 'ADM002', CURRENT_TIMESTAMP, 10, 'Active'),
('Vehicle Crime', 8, 'High', 'Car theft', '2025-10-07', '02:00:00', 'PUB008', 'ADM001', CURRENT_TIMESTAMP, 10, 'Active'),
('Vandalism', 5, 'Low', 'Shop window broken', '2025-09-30', '23:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 10, 'Resolved'),

-- Shivajinagar - Mixed
('Theft', 1, 'Medium', 'Bag snatching', '2025-10-19', '18:00:00', 'PUB001', 'ADM001', CURRENT_TIMESTAMP, 3, 'Active'),
('Assault', 2, 'High', 'Gang fight', '2025-10-11', '21:00:00', 'PUB002', 'ADM002', CURRENT_TIMESTAMP, 3, 'Under Investigation'),
('Vandalism', 5, 'Low', 'Park damage', '2025-10-03', '08:00:00', 'PUB003', 'ADM001', CURRENT_TIMESTAMP, 3, 'Resolved'),

-- JP Nagar - Low crime area
('Theft', 1, 'Low', 'Minor theft', '2025-10-16', '16:00:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 7, 'Resolved'),
('Vandalism', 5, 'Low', 'Wall graffiti', '2025-10-08', '10:00:00', 'PUB005', 'ADM002', CURRENT_TIMESTAMP, 7, 'Resolved'),

-- Hebbal - Mixed
('Theft', 1, 'Medium', 'Phone stolen', '2025-10-20', '19:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 8, 'Active');

-- Make more crimes Resolved, fewer Active
UPDATE CrimeRecord 
SET Status = 'Resolved' 
WHERE CrimeID IN (2, 3, 5, 7, 9, 13, 15, 16, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48);

UPDATE CrimeRecord 
SET Status = 'Active' 
WHERE CrimeID IN (1, 4, 6, 8, 11, 12, 21, 23, 25, 41, 43, 45, 47, 49, 50);

UPDATE CrimeRecord 
SET Status = 'Under Investigation' 
WHERE CrimeID IN (10, 14, 17, 27, 29, 31, 33, 35, 37, 39);

-- Add 30 more crimes for better variance
INSERT INTO CrimeRecord (Type, CategoryID, Severity, Description, OccurredOn, OccurredTime, ReportedBy, VerifiedBy, VerifiedOn, LocationID, Status)
VALUES
-- Koramangala
('Assault', 2, 'High', 'Bar fight escalated', '2025-10-22', '23:30:00', 'PUB001', 'ADM001', CURRENT_TIMESTAMP, 2, 'Active'),
('Robbery', 4, 'High', 'Armed robbery at ATM', '2025-10-19', '02:15:00', 'PUB002', 'ADM001', CURRENT_TIMESTAMP, 2, 'Active'),
('Drug-related', 7, 'High', 'Drug peddling reported', '2025-10-14', '21:00:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 2, 'Under Investigation'),
('Theft', 1, 'Medium', 'Phone snatched', '2025-10-07', '19:45:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 2, 'Active'),
('Burglary', 3, 'High', 'Apartment break-in', '2025-09-28', '03:30:00', 'PUB005', 'ADM002', CURRENT_TIMESTAMP, 2, 'Active'),

-- Indiranagar
('Robbery', 4, 'High', 'Jewelry store robbery', '2025-10-16', '20:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 1, 'Under Investigation'),
('Assault', 2, 'Medium', 'Road rage incident', '2025-10-09', '18:30:00', 'PUB007', 'ADM002', CURRENT_TIMESTAMP, 1, 'Active'),
('Theft', 1, 'Medium', 'Wallet stolen', '2025-09-30', '14:00:00', 'PUB008', 'ADM001', CURRENT_TIMESTAMP, 1, 'Resolved'),
('Vehicle Crime', 8, 'High', 'Car stolen from parking', '2025-10-21', '01:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 1, 'Active'),
('Cyber Crime', 9, 'Medium', 'Online fraud case', '2025-10-11', '10:30:00', 'PUB010', 'ADM001', CURRENT_TIMESTAMP, 1, 'Active'),

-- BTM Layout
('Burglary', 3, 'High', 'House burglary', '2025-10-18', '04:00:00', 'PUB001', 'ADM002', CURRENT_TIMESTAMP, 5, 'Active'),
('Assault', 2, 'High', 'Street assault', '2025-10-12', '22:00:00', 'PUB002', 'ADM001', CURRENT_TIMESTAMP, 5, 'Active'),
('Theft', 1, 'Medium', 'Bike parts stolen', '2025-10-05', '07:00:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 5, 'Resolved'),
('Robbery', 4, 'High', 'Store robbery', '2025-09-29', '21:30:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 5, 'Under Investigation'),
('Drug-related', 7, 'Medium', 'Drug possession', '2025-10-01', '16:00:00', 'PUB005', 'ADM002', CURRENT_TIMESTAMP, 5, 'Active'),

-- Whitefield
('Cyber Crime', 9, 'High', 'Corporate data breach', '2025-10-20', '11:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 4, 'Under Investigation'),
('Theft', 1, 'Medium', 'Laptop stolen from office', '2025-10-13', '19:00:00', 'PUB007', 'ADM002', CURRENT_TIMESTAMP, 4, 'Active'),
('Assault', 2, 'Medium', 'Workplace altercation', '2025-10-06', '15:30:00', 'PUB008', 'ADM001', CURRENT_TIMESTAMP, 4, 'Resolved'),
('Vehicle Crime', 8, 'High', 'Multiple bikes stolen', '2025-09-27', '23:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 4, 'Active'),
('Fraud', 6, 'High', 'Investment scam', '2025-10-17', '12:00:00', 'PUB010', 'ADM001', CURRENT_TIMESTAMP, 4, 'Active'),

-- Electronic City
('Robbery', 4, 'High', 'Armed robbery near tech park', '2025-10-24', '22:45:00', 'PUB001', 'ADM002', CURRENT_TIMESTAMP, 6, 'Active'),
('Assault', 2, 'High', 'Gang assault', '2025-10-15', '20:30:00', 'PUB002', 'ADM001', CURRENT_TIMESTAMP, 6, 'Under Investigation'),
('Drug-related', 7, 'High', 'Drug trafficking', '2025-10-08', '19:15:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 6, 'Active'),
('Murder', 11, 'High', 'Homicide case', '2025-09-26', '01:30:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 6, 'Under Investigation'),
('Burglary', 3, 'High', 'Factory break-in', '2025-10-03', '03:00:00', 'PUB005', 'ADM002', CURRENT_TIMESTAMP, 6, 'Active'),

-- Marathahalli
('Theft', 1, 'High', 'Multiple thefts at mall', '2025-10-23', '17:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 10, 'Active'),
('Assault', 2, 'Medium', 'Bar fight', '2025-10-14', '23:00:00', 'PUB007', 'ADM002', CURRENT_TIMESTAMP, 10, 'Active'),
('Vehicle Crime', 8, 'High', 'Car vandalism', '2025-10-07', '02:00:00', 'PUB008', 'ADM001', CURRENT_TIMESTAMP, 10, 'Resolved'),
('Robbery', 4, 'High', 'Phone snatching', '2025-09-30', '20:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 10, 'Active'),
('Fraud', 6, 'Medium', 'Credit card fraud', '2025-10-19', '14:00:00', 'PUB010', 'ADM001', CURRENT_TIMESTAMP, 10, 'Active');

