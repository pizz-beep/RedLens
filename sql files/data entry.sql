-- =============================================================
-- 🌆 DATA SEED START - RedLens City Crime Intelligence Dataset
-- =============================================================

-- 1️⃣ USERS
INSERT INTO User (UserID, Name, Role, Email, Password, PhoneNumber) VALUES
('ADM001', 'Priya Menon', 'Admin', 'priya.admin@redlens.in', 'hashed_pass_1', '9876543210'),
('ADM002', 'Ravi Sharma', 'Admin', 'ravi.admin@redlens.in', 'hashed_pass_2', '9812345678'),
('ANL001', 'Sneha Iyer', 'Analyst', 'sneha.analyst@redlens.in', 'hashed_pass_3', '9823456789'),
('ANL002', 'Arjun Patel', 'Analyst', 'arjun.analyst@redlens.in', 'hashed_pass_4', '9867891234'),
('ANL003', 'Deepa Rao', 'Analyst', 'deepa.analyst@redlens.in', 'hashed_pass_5', '9876111222'),
('PUB001', 'Aarav Nair', 'Public', 'aarav.public@redlens.in', 'hashed_pass_6', '9845123456'),
('PUB002', 'Isha Verma', 'Public', 'isha.public@redlens.in', 'hashed_pass_7', '9822123456'),
('PUB003', 'Karan Das', 'Public', 'karan.public@redlens.in', 'hashed_pass_8', '9833344556'),
('PUB004', 'Divya Rao', 'Public', 'divya.public@redlens.in', 'hashed_pass_9', '9812347777'),
('PUB005', 'Rahul Jain', 'Public', 'rahul.public@redlens.in', 'hashed_pass_10', '9876123456'),
('PUB006', 'Meera Joshi', 'Public', 'meera.public@redlens.in', 'hashed_pass_11', '9812233445'),
('PUB007', 'Aditya Singh', 'Public', 'aditya.public@redlens.in', 'hashed_pass_12', '9823450987'),
('PUB008', 'Nisha Bhat', 'Public', 'nisha.public@redlens.in', 'hashed_pass_13', '9832211987'),
('PUB009', 'Varun Pillai', 'Public', 'varun.public@redlens.in', 'hashed_pass_14', '9810076543'),
('PUB010', 'Tanya Dey', 'Public', 'tanya.public@redlens.in', 'hashed_pass_15', '9823098765');

-- 2️⃣ LOCATIONS (Bengaluru Neighborhoods)
INSERT INTO Location (Address, AreaName, Landmark, Latitude, Longitude, IsVerified) VALUES
('100 Feet Road', 'Indiranagar', 'CMH Road', 12.971891, 77.641151, TRUE),
('Forum Mall', 'Koramangala', 'Forum Mall', 12.935223, 77.624482, TRUE),
('MG Road', 'Shivajinagar', 'MG Metro', 12.978142, 77.603292, TRUE),
('Whitefield Main Road', 'Whitefield', 'ITPL', 12.969800, 77.750000, TRUE),
('BTM 2nd Stage', 'BTM Layout', 'Udupi Garden', 12.916575, 77.610116, TRUE),
('Electronic City Phase 1', 'Electronic City', 'Infosys Campus', 12.845214, 77.660169, TRUE),
('JP Nagar 7th Phase', 'JP Nagar', 'Ragigudda Temple', 12.906342, 77.585682, TRUE),
('Hebbal Flyover', 'Hebbal', 'Esteem Mall', 13.035838, 77.597023, TRUE),
('Yeshwanthpur', 'Yeshwanthpur', 'Orion Mall', 13.020690, 77.554462, TRUE),
('Marathahalli Bridge', 'Marathahalli', 'KLM Mall', 12.956963, 77.701793, TRUE),
('Rajajinagar', 'Rajajinagar', 'Navarang Theatre', 12.991800, 77.553800, TRUE),
('Basavanagudi', 'Basavanagudi', 'Bull Temple', 12.941650, 77.568710, TRUE),
('Malleshwaram', 'Malleshwaram', 'Mantri Mall', 13.001765, 77.570368, TRUE),
('KR Puram', 'KR Puram', 'Cable Bridge', 13.003700, 77.711800, TRUE),
('Banashankari', 'Banashankari', 'BSK Bus Depot', 12.918200, 77.573900, TRUE);

-- 3️⃣ CRIME RECORDS (Verified & Mixed)
INSERT INTO CrimeRecord (Type, CategoryID, Severity, Description, OccurredOn, OccurredTime, ReportedBy, VerifiedBy, VerifiedOn, LocationID, Status)
VALUES
('Robbery', 4, 'High', 'Snatching near traffic signal', '2025-10-05', '21:30:00', 'PUB001', 'ADM001', CURRENT_TIMESTAMP, 2, 'Active'),
('Theft', 1, 'Medium', 'Bike stolen at MG Road', '2025-09-27', '19:00:00', 'PUB002', 'ADM002', CURRENT_TIMESTAMP, 3, 'Resolved'),
('Assault', 2, 'High', 'Street fight near pub area', '2025-10-11', '23:45:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 2, 'Under Investigation'),
('Burglary', 3, 'High', 'Break-in at Whitefield apartment', '2025-09-30', '02:00:00', 'PUB004', 'ADM001', CURRENT_TIMESTAMP, 4, 'Active'),
('Cyber Crime', 9, 'Medium', 'Instagram fraud profile scam', '2025-10-10', '16:00:00', 'PUB005', 'ADM001', CURRENT_TIMESTAMP, 1, 'Resolved'),
('Drug-related', 7, 'High', 'Drug bust near Koramangala Club', '2025-09-25', '20:30:00', 'PUB002', 'ADM002', CURRENT_TIMESTAMP, 2, 'Active'),
('Vandalism', 5, 'Low', 'Bus stop glass broken', '2025-10-12', '09:00:00', 'PUB006', 'ADM001', CURRENT_TIMESTAMP, 5, 'Resolved'),
('Fraud', 6, 'Medium', 'Fake UPI app incident', '2025-10-18', '14:30:00', 'PUB007', 'ADM002', CURRENT_TIMESTAMP, 10, 'Active'),
('Vehicle Crime', 8, 'Medium', 'Car parts stolen', '2025-10-03', '05:00:00', 'PUB008', 'ADM001', CURRENT_TIMESTAMP, 11, 'Active'),
('Domestic Violence', 10, 'High', 'Reported domestic abuse case', '2025-09-21', '22:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 12, 'Under Investigation'),
('Murder', 11, 'High', 'Suspicious death reported', '2025-10-15', '01:00:00', 'PUB010', 'ADM001', CURRENT_TIMESTAMP, 9, 'Active'),
('Sexual Assault', 12, 'High', 'Incident near bus terminal', '2025-10-08', '22:15:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 8, 'Active'),
('Arson', 14, 'High', 'Vehicle set ablaze in BTM Layout', '2025-10-17', '04:10:00', 'PUB001', 'ADM001', CURRENT_TIMESTAMP, 5, 'Active'),
('Robbery', 4, 'Medium', 'Chain snatching near Rajajinagar', '2025-09-25', '20:00:00', 'PUB004', 'ADM002', CURRENT_TIMESTAMP, 11, 'Resolved'),
('Theft', 1, 'Low', 'Petty theft reported in Malleshwaram market', '2025-10-20', '12:30:00', 'PUB005', 'ADM001', CURRENT_TIMESTAMP, 13, 'Active'),
('Fraud', 6, 'Medium', 'Online loan scam complaint', '2025-09-18', '13:00:00', 'PUB007', 'ADM001', CURRENT_TIMESTAMP, 14, 'Resolved'),
('Kidnapping', 13, 'High', 'Attempted abduction case in KR Puram', '2025-09-29', '18:00:00', 'PUB009', 'ADM002', CURRENT_TIMESTAMP, 14, 'Under Investigation'),
('Burglary', 3, 'Medium', 'Store robbery in Banashankari', '2025-10-01', '03:15:00', 'PUB010', 'ADM002', CURRENT_TIMESTAMP, 15, 'Resolved'),
('Cyber Crime', 9, 'Medium', 'Credit card phishing site detected', '2025-09-22', '15:30:00', 'PUB002', 'ADM001', CURRENT_TIMESTAMP, 4, 'Active'),
('Vandalism', 5, 'Low', 'School wall vandalized', '2025-09-23', '10:45:00', 'PUB003', 'ADM002', CURRENT_TIMESTAMP, 7, 'Active');

-- 4️⃣ CITIZEN REPORTS (Pending + Verified + Rejected)
INSERT INTO CitizenReports (CrimeType, CategoryID, Severity, Description, IncidentDate, IncidentTime, Status, UserID, LocationID)
VALUES
('Theft', 1, 'Medium', 'Wallet stolen near BTM bus stop', '2025-10-30', '19:00:00', 'Pending', 'PUB001', 5),
('Vandalism', 5, 'Low', 'Graffiti on metro pillar', '2025-10-25', '11:00:00', 'Pending', 'PUB002', 3),
('Assault', 2, 'High', 'Fight at Koramangala 4th block', '2025-10-15', '22:30:00', 'Verified', 'PUB003', 2),
('Fraud', 6, 'Medium', 'Scam call regarding fake KYC', '2025-10-12', '15:20:00', 'Verified', 'PUB004', 1),
('Cyber Crime', 9, 'Medium', 'Instagram hacking attempt', '2025-10-17', '14:45:00', 'Pending', 'PUB005', 10),
('Drug-related', 7, 'High', 'Suspicious activity near park', '2025-10-05', '18:00:00', 'Verified', 'PUB006', 6),
('Robbery', 4, 'High', 'Two men robbed a local store', '2025-10-02', '21:00:00', 'Rejected', 'PUB007', 11),
('Burglary', 3, 'Medium', 'Attempted break-in', '2025-09-30', '03:10:00', 'Verified', 'PUB008', 12),
('Assault', 2, 'Medium', 'Verbal harassment reported', '2025-10-28', '20:15:00', 'Pending', 'PUB009', 9),
('Theft', 1, 'Low', 'Lost bicycle', '2025-10-26', '17:00:00', 'Pending', 'PUB010', 13);

-- 5️⃣ SAFETY SCORES
INSERT INTO SafetyScore (LocationID, AreaName, ScoreValue, CrimeCount, HighSeverityCount, ComputedOn, ComputedBy)
VALUES
(1, 'Indiranagar', 78, 5, 1, '2025-11-05', 'ANL001'),
(2, 'Koramangala', 58, 8, 3, '2025-11-05', 'ANL002'),
(3, 'Shivajinagar', 82, 4, 1, '2025-11-05', 'ANL003'),
(4, 'Whitefield', 73, 5, 2, '2025-11-05', 'ANL001'),
(5, 'BTM Layout', 65, 7, 3, '2025-11-05', 'ANL002'),
(6, 'Electronic City', 50, 9, 4, '2025-11-05', 'ANL003'),
(7, 'JP Nagar', 88, 3, 0, '2025-11-05', 'ANL002'),
(8, 'Hebbal', 76, 4, 1, '2025-11-05', 'ANL001'),
(9, 'Yeshwanthpur', 69, 6, 2, '2025-11-05', 'ANL003'),
(10, 'Marathahalli', 61, 7, 3, '2025-11-05', 'ANL001'),
(11, 'Rajajinagar', 67, 6, 2, '2025-11-05', 'ANL002'),
(12, 'Basavanagudi', 80, 4, 0, '2025-11-05', 'ANL003'),
(13, 'Malleshwaram', 77, 5, 1, '2025-11-05', 'ANL001'),
(14, 'KR Puram', 59, 8, 3, '2025-11-05', 'ANL002'),
(15, 'Banashankari', 84, 3, 0, '2025-11-05', 'ANL003');

-- 6️⃣ HOTSPOTS
INSERT INTO Hotspots (LocationID, AreaName, CrimeDensity, CrimeCount, RadiusMeters, RiskLevel, ComputedOn, ComputedBy)
VALUES
(2, 'Koramangala', 16.2, 9, 500, 'High', '2025-11-05', 'ANL001'),
(4, 'Whitefield', 13.5, 7, 500, 'Medium', '2025-11-05', 'ANL002'),
(5, 'BTM Layout', 11.0, 6, 500, 'Medium', '2025-11-05', 'ANL002'),
(6, 'Electronic City', 18.9, 10, 500, 'Critical', '2025-11-05', 'ANL003'),
(9, 'Yeshwanthpur', 15.5, 8, 500, 'High', '2025-11-05', 'ANL002'),
(11, 'Rajajinagar', 14.2, 7, 500, 'High', '2025-11-05', 'ANL001'),
(14, 'KR Puram', 12.3, 7, 500, 'Medium', '2025-11-05', 'ANL003');

-- 7️⃣ REPORTS
INSERT INTO Reports (Title, Type, Description, StartDate, EndDate, FilterArea, FilterSeverity, TotalCrimes, AverageSafetyScore, AnalystID)
VALUES
('Koramangala Crime Summary - Oct 2025', 'Crime Summary', 'Detailed crime activity report for Koramangala.', '2025-10-01', '2025-10-31', 'Koramangala', NULL, 8, 58.0, 'ANL001'),
('BTM Layout Safety Report', 'Safety Trend', 'Safety trend for BTM area showing medium risk levels.', '2025-09-01', '2025-10-31', 'BTM Layout', NULL, 7, 65.0, 'ANL002'),
('Citywide Crime Overview - Q4', 'Hotspot Analysis', 'Identified top 5 high-risk zones in Bengaluru.', '2025-09-01', '2025-10-31', NULL, 'High', 35, 68.0, 'ANL003'),
('KR Puram Incident Summary', 'Area Report', 'Frequent medium severity crimes noted.', '2025-10-01', '2025-10-31', 'KR Puram', 'Medium', 7, 59.0, 'ANL002'),
('Electronic City Critical Alert', 'Custom', 'Drug and assault-related spike noticed.', '2025-09-15', '2025-10-31', 'Electronic City', 'High', 10, 50.0, 'ANL003');

-- 8️⃣ AREA STATISTICS (Auto Refresh Recommended)
CALL sp_RefreshAllAreaStats();

-- =============================================================
-- 🌇 DATA SEED END
-- =============================================================
