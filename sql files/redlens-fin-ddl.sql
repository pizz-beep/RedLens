	-- ============================================
-- RedLens Database - Enhanced DDL Statements
-- GIS-powered crime analysis with hotspot detection
-- ============================================

DROP DATABASE IF EXISTS RedLens;
CREATE DATABASE RedLens;
USE RedLens;

-- ============================================
-- TABLE: User (Role-based access control)
-- ============================================
CREATE TABLE User (
    UserID VARCHAR(10) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Admin', 'Analyst', 'Public')),
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,  -- For hashed passwords
    PhoneNumber VARCHAR(15),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP NULL,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (Email),
    INDEX idx_user_role (Role),
    INDEX idx_user_active (IsActive)
);

-- ============================================
-- TABLE: CrimeCategory
-- ============================================
CREATE TABLE CrimeCategory (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(50) UNIQUE NOT NULL,
    Description TEXT,
    SeverityWeight DECIMAL(3,2) DEFAULT 1.0,  -- Weight for safety score calculation
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_name (CategoryName)
);

-- ============================================
-- TABLE: Location (GIS-powered with 6 decimal precision)
-- ============================================
CREATE TABLE Location (
    LocationID INT AUTO_INCREMENT PRIMARY KEY,
    Address VARCHAR(200),
    AreaName VARCHAR(100) NOT NULL,  -- For neighborhood grouping (required)
    Landmark VARCHAR(100),  -- NEW: Nearby landmark for better identification
    City VARCHAR(100) DEFAULT 'Bengaluru',
    State VARCHAR(100) DEFAULT 'Karnataka',
    Pincode VARCHAR(10),
    Latitude DECIMAL(9, 6) NOT NULL,  -- 6 decimal precision as per requirements
    Longitude DECIMAL(9, 6) NOT NULL,  -- 6 decimal precision
    IsVerified BOOLEAN DEFAULT FALSE,  -- Admin verification flag
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Under Review')),  -- NEW
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location_area (AreaName),
    INDEX idx_location_pincode (Pincode),
    INDEX idx_location_coords (Latitude, Longitude),
    INDEX idx_location_verified (IsVerified),
    INDEX idx_location_status (Status),  -- NEW
    -- Ensure unique coordinates to avoid redundancy
    UNIQUE KEY unique_coords (Latitude, Longitude)
);

-- ============================================
-- TABLE: CrimeRecord (Verified crimes only)
-- ============================================
CREATE TABLE CrimeRecord (
    CrimeID INT AUTO_INCREMENT PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,
    CategoryID INT NOT NULL,
    Severity VARCHAR(20) NOT NULL CHECK (Severity IN ('Low', 'Medium', 'High')),
    Description TEXT,
    OccurredOn DATE NOT NULL,
    OccurredTime TIME,  -- NEW: Time of crime occurrence
    ReportedBy VARCHAR(10),  -- User who reported (can be null for system-generated)
    VerifiedBy VARCHAR(10),  -- NEW: Admin who verified this record
    VerifiedOn TIMESTAMP,  -- NEW: When it was verified
    LocationID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Resolved', 'Under Investigation')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ReportedBy) REFERENCES User(UserID) ON DELETE SET NULL,
    FOREIGN KEY (VerifiedBy) REFERENCES User(UserID) ON DELETE SET NULL,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES CrimeCategory(CategoryID) ON DELETE RESTRICT,
    INDEX idx_crime_date (OccurredOn),
    INDEX idx_crime_location (LocationID),
    INDEX idx_crime_severity (Severity),
    INDEX idx_crime_type (Type),
    INDEX idx_crime_category (CategoryID),
    INDEX idx_crime_status (Status),
    INDEX idx_crime_verified (VerifiedBy, VerifiedOn)
);

-- ============================================
-- TABLE: CitizenReports (Unverified reports from public)
-- ============================================
CREATE TABLE CitizenReports (
    PublicReportID INT AUTO_INCREMENT PRIMARY KEY,
    CrimeType VARCHAR(50) NOT NULL,
    CategoryID INT,  -- NEW: Link to crime category
    Severity VARCHAR(20) CHECK (Severity IN ('Low', 'Medium', 'High')),
    Description TEXT NOT NULL,
    IncidentDate DATE,  -- NEW: When the crime occurred
    IncidentTime TIME,  -- NEW: Time of incident
    Status VARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Verified', 'Rejected')),
    SubmittedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReviewedBy VARCHAR(10),  -- Admin who reviewed
    ReviewedOn TIMESTAMP,
    RejectionReason TEXT,
    LinkedCrimeID INT,  -- NEW: Reference to CrimeRecord if verified
    UserID VARCHAR(10) NOT NULL,
    LocationID INT NOT NULL,
    AttachmentURL VARCHAR(500),  -- NEW: Optional evidence/photo
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ReviewedBy) REFERENCES User(UserID) ON DELETE SET NULL,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES CrimeCategory(CategoryID) ON DELETE SET NULL,
    FOREIGN KEY (LinkedCrimeID) REFERENCES CrimeRecord(CrimeID) ON DELETE SET NULL,
    INDEX idx_citizen_status (Status),
    INDEX idx_citizen_user (UserID),
    INDEX idx_citizen_location (LocationID),
    INDEX idx_citizen_submitted (SubmittedOn),
    INDEX idx_citizen_reviewed (ReviewedBy),
    INDEX idx_citizen_pending (Status, SubmittedOn)
);

-- ============================================
-- TABLE: SafetyScore (Area-based safety scoring)
-- ============================================
CREATE TABLE SafetyScore (
    ScoreID INT AUTO_INCREMENT PRIMARY KEY,
    LocationID INT NOT NULL,
    AreaName VARCHAR(100) NOT NULL,  -- Denormalized for quick area-based queries
    ScoreValue INT NOT NULL CHECK (ScoreValue BETWEEN 0 AND 100),
    CrimeCount INT DEFAULT 0,  -- NEW: Total crimes used in calculation
    HighSeverityCount INT DEFAULT 0,  -- NEW: Count of high severity crimes
    ComputedOn DATE NOT NULL,
    ComputedBy VARCHAR(10),  -- NEW: Analyst who computed
    Algorithm VARCHAR(50) DEFAULT 'Weighted Density',  -- NEW: Algorithm used
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE,
    FOREIGN KEY (ComputedBy) REFERENCES User(UserID) ON DELETE SET NULL,
    INDEX idx_safety_location (LocationID),
    INDEX idx_safety_area (AreaName),
    INDEX idx_safety_computed (ComputedOn),
    INDEX idx_safety_value (ScoreValue),
    -- Prevent duplicate scores per location per day
    UNIQUE KEY unique_location_date (LocationID, ComputedOn)
);

-- ============================================
-- TABLE: Hotspots (Crime density mapping)
-- ============================================
CREATE TABLE Hotspots (
    HotspotID INT AUTO_INCREMENT PRIMARY KEY,
    LocationID INT NOT NULL,
    AreaName VARCHAR(100) NOT NULL,  -- Denormalized for quick filtering
    CrimeDensity DECIMAL(5, 2) NOT NULL,  -- Crimes per sq km or similar metric
    CrimeCount INT DEFAULT 0,  -- NEW: Actual crime count
    RadiusMeters INT DEFAULT 500,  -- NEW: Radius considered for hotspot
    RiskLevel VARCHAR(20) CHECK (RiskLevel IN ('Low', 'Medium', 'High', 'Critical')),
    ComputedOn DATE NOT NULL,
    ComputedBy VARCHAR(10),  -- NEW: Analyst who generated
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID) ON DELETE CASCADE,
    FOREIGN KEY (ComputedBy) REFERENCES User(UserID) ON DELETE SET NULL,
    INDEX idx_hotspot_location (LocationID),
    INDEX idx_hotspot_area (AreaName),
    INDEX idx_hotspot_density (CrimeDensity),
    INDEX idx_hotspot_risk (RiskLevel),
    INDEX idx_hotspot_computed (ComputedOn),
    -- Ensure unique hotspot per location per day
    UNIQUE KEY unique_hotspot_date (LocationID, ComputedOn)
);

-- ============================================
-- TABLE: Reports (Analyst-generated reports)
-- ============================================
CREATE TABLE Reports (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Type VARCHAR(50) NOT NULL CHECK (Type IN ('Hotspot Analysis', 'Safety Trend', 'Crime Summary', 'Area Report', 'Custom')),
    Description TEXT,
    StartDate DATE,  -- NEW: Report period start
    EndDate DATE,  -- NEW: Report period end
    FilterArea VARCHAR(100),  -- NEW: Area filter applied
    FilterCrimeType VARCHAR(50),  -- NEW: Crime type filter
    FilterSeverity VARCHAR(20),  -- NEW: Severity filter
    FilterParams JSON,  -- Additional filter criteria
    TotalCrimes INT DEFAULT 0,  -- NEW: Summary stat
    AverageSafetyScore DECIMAL(5,2),  -- NEW: Summary stat
    GeneratedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    AnalystID VARCHAR(10) NOT NULL,
    ReportFileURL VARCHAR(500),  -- NEW: Path to generated report file
    FOREIGN KEY (AnalystID) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_report_analyst (AnalystID),
    INDEX idx_report_generated (GeneratedAt),
    INDEX idx_report_type (Type),
    INDEX idx_report_area (FilterArea)
);

-- ============================================
-- TABLE: CrimeAuditLog (Audit trail for data changes)
-- ============================================
CREATE TABLE CrimeAuditLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    EntityType VARCHAR(50) NOT NULL,  -- 'CrimeRecord', 'CitizenReport', 'User', etc.
    EntityID INT NOT NULL,
    Action VARCHAR(20) NOT NULL CHECK (Action IN ('INSERT', 'UPDATE', 'DELETE', 'VERIFY', 'REJECT')),
    PerformedBy VARCHAR(10) NOT NULL,
    PerformedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    OldData JSON,
    NewData JSON,
    ChangeReason TEXT,
    FOREIGN KEY (PerformedBy) REFERENCES User(UserID) ON DELETE CASCADE,
    INDEX idx_audit_entity (EntityType, EntityID),
    INDEX idx_audit_user (PerformedBy),
    INDEX idx_audit_date (PerformedAt),
    INDEX idx_audit_action (Action)
);

-- ============================================
-- TABLE: AreaStatistics (Pre-computed area stats for performance)
-- ============================================
CREATE TABLE AreaStatistics (
    StatID INT AUTO_INCREMENT PRIMARY KEY,
    AreaName VARCHAR(100) NOT NULL UNIQUE,
    TotalCrimes INT DEFAULT 0,
    CrimesLastMonth INT DEFAULT 0,
    CrimesLastYear INT DEFAULT 0,
    HighSeverityCrimes INT DEFAULT 0,
    MostCommonCrimeType VARCHAR(50),
    CurrentSafetyScore INT,
    LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_area_name (AreaName),
    INDEX idx_area_score (CurrentSafetyScore)
);

-- ============================================
-- Sample Data for CrimeCategory
-- ============================================
INSERT INTO CrimeCategory (CategoryName, Description, SeverityWeight) VALUES
('Theft', 'Unlawful taking of property', 0.6),
('Assault', 'Physical attack or threat of attack', 0.9),
('Burglary', 'Breaking and entering with intent to commit crime', 0.8),
('Robbery', 'Theft involving force or threat', 1.0),
('Vandalism', 'Willful destruction of property', 0.4),
('Fraud', 'Wrongful deception for financial gain', 0.5),
('Drug-related', 'Possession, distribution, or use of illegal drugs', 0.7),
('Vehicle Crime', 'Theft or damage to vehicles', 0.6),
('Cyber Crime', 'Computer or internet-based crimes', 0.5),
('Domestic Violence', 'Violence within domestic settings', 0.9),
('Murder', 'Unlawful killing of another person', 1.0),
('Sexual Assault', 'Non-consensual sexual contact', 1.0),
('Kidnapping', 'Unlawful abduction of a person', 1.0),
('Arson', 'Willful fire-setting', 0.8),
('Other', 'Crimes not fitting other categories', 0.3);

-- ============================================
-- VIEWS for Common Queries
-- ============================================

-- View: Active Crimes by Area
CREATE VIEW v_ActiveCrimesByArea AS
SELECT 
    l.AreaName,
    l.City,
    COUNT(c.CrimeID) AS CrimeCount,
    SUM(CASE WHEN c.Severity = 'High' THEN 1 ELSE 0 END) AS HighSeverityCount,
    AVG(CASE 
        WHEN c.Severity = 'High' THEN 3
        WHEN c.Severity = 'Medium' THEN 2
        ELSE 1
    END) AS AvgSeverityLevel
FROM Location l
LEFT JOIN CrimeRecord c ON l.LocationID = c.LocationID AND c.Status = 'Active'
GROUP BY l.AreaName, l.City;

-- View: Latest Safety Scores by Area
CREATE VIEW v_LatestSafetyScores AS
SELECT 
    ss.AreaName,
    ss.ScoreValue,
    ss.CrimeCount,
    ss.ComputedOn,
    CASE 
        WHEN ss.ScoreValue >= 80 THEN 'Safe'
        WHEN ss.ScoreValue >= 60 THEN 'Moderate'
        WHEN ss.ScoreValue >= 40 THEN 'Risky'
        ELSE 'Dangerous'
    END AS RiskCategory
FROM SafetyScore ss
INNER JOIN (
    SELECT AreaName, MAX(ComputedOn) AS MaxDate
    FROM SafetyScore
    GROUP BY AreaName
) latest ON ss.AreaName = latest.AreaName AND ss.ComputedOn = latest.MaxDate;

-- View: Pending Citizen Reports
CREATE VIEW v_PendingReports AS
SELECT 
    cr.PublicReportID,
    cr.CrimeType,
    cr.Severity,
    cr.SubmittedOn,
    u.Name AS ReporterName,
    u.Email AS ReporterEmail,
    l.AreaName,
    l.Address,
    DATEDIFF(CURRENT_DATE, cr.SubmittedOn) AS DaysPending
FROM CitizenReports cr
JOIN User u ON cr.UserID = u.UserID
JOIN Location l ON cr.LocationID = l.LocationID
WHERE cr.Status = 'Pending'
ORDER BY cr.SubmittedOn ASC;

-- View: Current Hotspots
CREATE VIEW v_CurrentHotspots AS
SELECT 
    h.HotspotID,
    h.AreaName,
    h.CrimeDensity,
    h.CrimeCount,
    h.RiskLevel,
    l.Latitude,
    l.Longitude,
    h.ComputedOn
FROM Hotspots h
JOIN Location l ON h.LocationID = l.LocationID
INNER JOIN (
    SELECT AreaName, MAX(ComputedOn) AS MaxDate
    FROM Hotspots
    GROUP BY AreaName
) latest ON h.AreaName = latest.AreaName AND h.ComputedOn = latest.MaxDate
WHERE h.RiskLevel IN ('High', 'Critical');

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Verify Citizen Report and Create Crime Record
CREATE PROCEDURE sp_VerifyCitizenReport(
    IN p_ReportID INT,
    IN p_AdminID VARCHAR(10),
    IN p_Action VARCHAR(20),  -- 'VERIFY' or 'REJECT'
    IN p_RejectionReason TEXT
)
BEGIN
    DECLARE v_CrimeID INT;
    DECLARE v_UserID VARCHAR(10);
    DECLARE v_LocationID INT;
    DECLARE v_CrimeType VARCHAR(50);
    DECLARE v_CategoryID INT;
    DECLARE v_Severity VARCHAR(20);
    DECLARE v_Description TEXT;
    DECLARE v_IncidentDate DATE;
    DECLARE v_IncidentTime TIME;
    
    START TRANSACTION;
    
    IF p_Action = 'VERIFY' THEN
        -- Get report details
        SELECT UserID, LocationID, CrimeType, CategoryID, Severity, Description, IncidentDate, IncidentTime
        INTO v_UserID, v_LocationID, v_CrimeType, v_CategoryID, v_Severity, v_Description, v_IncidentDate, v_IncidentTime
        FROM CitizenReports
        WHERE PublicReportID = p_ReportID AND Status = 'Pending';
        
        -- Create crime record
        INSERT INTO CrimeRecord (Type, CategoryID, Severity, Description, OccurredOn, OccurredTime, 
                                ReportedBy, VerifiedBy, VerifiedOn, LocationID, Status)
        VALUES (v_CrimeType, v_CategoryID, v_Severity, v_Description, v_IncidentDate, v_IncidentTime,
                v_UserID, p_AdminID, CURRENT_TIMESTAMP, v_LocationID, 'Active');
        
        SET v_CrimeID = LAST_INSERT_ID();
        
        -- Update citizen report
        UPDATE CitizenReports
        SET Status = 'Verified', ReviewedBy = p_AdminID, ReviewedOn = CURRENT_TIMESTAMP, LinkedCrimeID = v_CrimeID
        WHERE PublicReportID = p_ReportID;
        
        -- Log the action
        INSERT INTO CrimeAuditLog (EntityType, EntityID, Action, PerformedBy, ChangeReason)
        VALUES ('CitizenReport', p_ReportID, 'VERIFY', p_AdminID, 'Report verified and converted to CrimeRecord');
        
    ELSE  -- REJECT
        UPDATE CitizenReports
        SET Status = 'Rejected', ReviewedBy = p_AdminID, ReviewedOn = CURRENT_TIMESTAMP, RejectionReason = p_RejectionReason
        WHERE PublicReportID = p_ReportID;
        
        -- Log the action
        INSERT INTO CrimeAuditLog (EntityType, EntityID, Action, PerformedBy, ChangeReason)
        VALUES ('CitizenReport', p_ReportID, 'REJECT', p_AdminID, p_RejectionReason);
    END IF;
    
    COMMIT;
END //

DELIMITER //
-- Calulate Safety Score
DELIMITER //

DROP PROCEDURE IF EXISTS sp_CalculateSafetyScore //

CREATE PROCEDURE sp_CalculateSafetyScore(
    IN p_AreaName VARCHAR(100),
    IN p_AnalystID VARCHAR(10),
    IN p_DaysBack INT
)
BEGIN
    DECLARE v_LocationID INT;
    DECLARE v_TotalCrimes INT DEFAULT 0;
    DECLARE v_HighSeverity INT DEFAULT 0;
    DECLARE v_WeightedScore DECIMAL(10,2) DEFAULT 0;
    DECLARE v_SafetyScore INT DEFAULT 50;
    
    SELECT LocationID INTO v_LocationID
    FROM Location
    WHERE AreaName = p_AreaName
    LIMIT 1;
    
    IF v_LocationID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Area not found';
    END IF;
    
    SELECT 
        COALESCE(COUNT(*), 0) AS TotalCrimes,
        COALESCE(SUM(CASE WHEN Severity = 'High' THEN 1 ELSE 0 END), 0) AS HighSeverity
    INTO v_TotalCrimes, v_HighSeverity
    FROM CrimeRecord cr
    JOIN Location l ON cr.LocationID = l.LocationID
    WHERE l.AreaName = p_AreaName
    AND cr.OccurredOn >= DATE_SUB(CURRENT_DATE, INTERVAL p_DaysBack DAY);
    
    SET v_WeightedScore = v_HighSeverity * 15;
    SET v_SafetyScore = GREATEST(0, LEAST(100, 100 - v_WeightedScore));
    
    INSERT INTO SafetyScore (LocationID, AreaName, ScoreValue, CrimeCount, HighSeverityCount, 
                            ComputedOn, ComputedBy)
    VALUES (v_LocationID, p_AreaName, v_SafetyScore, v_TotalCrimes, v_HighSeverity, 
            CURRENT_DATE, p_AnalystID)
    ON DUPLICATE KEY UPDATE
        ScoreValue = v_SafetyScore,
        CrimeCount = v_TotalCrimes,
        HighSeverityCount = v_HighSeverity,
        ComputedBy = p_AnalystID,
        UpdatedAt = CURRENT_TIMESTAMP;
    
END //

DELIMITER ;


-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger: Auto-log crime record changes
CREATE TRIGGER trg_CrimeRecord_AfterInsert
AFTER INSERT ON CrimeRecord
FOR EACH ROW
BEGIN
    INSERT INTO CrimeAuditLog (EntityType, EntityID, Action, PerformedBy, NewData)
    VALUES ('CrimeRecord', NEW.CrimeID, 'INSERT', NEW.VerifiedBy,
            JSON_OBJECT('Type', NEW.Type, 'Severity', NEW.Severity, 'LocationID', NEW.LocationID));
END //

CREATE TRIGGER trg_CrimeRecord_AfterUpdate
AFTER UPDATE ON CrimeRecord
FOR EACH ROW
BEGIN
    INSERT INTO CrimeAuditLog (EntityType, EntityID, Action, PerformedBy, OldData, NewData)
    VALUES ('CrimeRecord', NEW.CrimeID, 'UPDATE', NEW.VerifiedBy,
            JSON_OBJECT('Type', OLD.Type, 'Severity', OLD.Severity, 'Status', OLD.Status),
            JSON_OBJECT('Type', NEW.Type, 'Severity', NEW.Severity, 'Status', NEW.Status));
END //

CREATE TRIGGER trg_CrimeRecord_AfterDelete
AFTER DELETE ON CrimeRecord
FOR EACH ROW
BEGIN
    INSERT INTO CrimeAuditLog (EntityType, EntityID, Action, PerformedBy, OldData)
    VALUES ('CrimeRecord', OLD.CrimeID, 'DELETE', OLD.VerifiedBy,
            JSON_OBJECT('Type', OLD.Type, 'Severity', OLD.Severity, 'LocationID', OLD.LocationID));
END //

-- Trigger: Update AreaStatistics when crime record is added
CREATE TRIGGER trg_UpdateAreaStats_AfterCrimeInsert
AFTER INSERT ON CrimeRecord
FOR EACH ROW
BEGIN
    DECLARE v_AreaName VARCHAR(100);
    
    SELECT AreaName INTO v_AreaName
    FROM Location WHERE LocationID = NEW.LocationID;
    
    INSERT INTO AreaStatistics (AreaName, TotalCrimes, HighSeverityCrimes, LastUpdated)
    VALUES (v_AreaName, 1, IF(NEW.Severity = 'High', 1, 0), CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
        TotalCrimes = TotalCrimes + 1,
        HighSeverityCrimes = HighSeverityCrimes + IF(NEW.Severity = 'High', 1, 0),
        LastUpdated = CURRENT_TIMESTAMP;
END //

-- Trigger: Prevent deletion of verified crime records (soft delete only)
CREATE TRIGGER trg_PreventCrimeDeletion
BEFORE DELETE ON CrimeRecord
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Cannot delete verified crime records. Update status to Resolved instead.';
END //

-- Trigger: Validate location coordinates are within Karnataka bounds
CREATE TRIGGER trg_ValidateLocationCoordinates
BEFORE INSERT ON Location
FOR EACH ROW
BEGIN
    -- Karnataka approximate bounds: Lat 11.5-18.5, Long 74-78.5
    IF NEW.Latitude < 11.5 OR NEW.Latitude > 18.5 OR 
       NEW.Longitude < 74.0 OR NEW.Longitude > 78.5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Coordinates must be within Karnataka bounds';
    END IF;
END //

-- Trigger: Auto-reject old pending reports (30+ days)
CREATE TRIGGER trg_AutoRejectOldReports
BEFORE UPDATE ON CitizenReports
FOR EACH ROW
BEGIN
    IF OLD.Status = 'Pending' AND 
       DATEDIFF(CURRENT_DATE, OLD.SubmittedOn) > 30 AND
       NEW.Status = 'Pending' THEN
        SET NEW.Status = 'Rejected';
        SET NEW.RejectionReason = 'Auto-rejected: Report older than 30 days';
        SET NEW.ReviewedOn = CURRENT_TIMESTAMP;
    END IF;
END //

-- Trigger: Prevent public users from creating admin/analyst accounts
CREATE TRIGGER trg_ValidateUserRole
BEFORE INSERT ON User
FOR EACH ROW
BEGIN
    IF NEW.Role IN ('Admin', 'Analyst') AND NEW.UserID NOT LIKE 'ADM%' AND NEW.UserID NOT LIKE 'ANL%' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid UserID format for Admin/Analyst role';
    END IF;
END //

-- Trigger: Update LastLogin on authentication (simulated)
CREATE TRIGGER trg_UpdateLastLogin
BEFORE UPDATE ON User
FOR EACH ROW
BEGIN
    IF NEW.Password != OLD.Password THEN
        SET NEW.LastLogin = CURRENT_TIMESTAMP;
    END IF;
END //

DELIMITER ;

-- ============================================
-- ADDITIONAL STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Get Crime Statistics for Area
CREATE PROCEDURE sp_GetAreaCrimeStats(
    IN p_AreaName VARCHAR(100),
    IN p_StartDate DATE,
    IN p_EndDate DATE
)
BEGIN
    SELECT 
        cc.CategoryName,
        COUNT(*) AS CrimeCount,
        SUM(CASE WHEN cr.Severity = 'High' THEN 1 ELSE 0 END) AS HighSeverityCount,
        SUM(CASE WHEN cr.Severity = 'Medium' THEN 1 ELSE 0 END) AS MediumSeverityCount,
        SUM(CASE WHEN cr.Severity = 'Low' THEN 1 ELSE 0 END) AS LowSeverityCount
    FROM CrimeRecord cr
    JOIN Location l ON cr.LocationID = l.LocationID
    JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
    WHERE l.AreaName = p_AreaName
    AND cr.OccurredOn BETWEEN p_StartDate AND p_EndDate
    GROUP BY cc.CategoryName
    ORDER BY CrimeCount DESC;
END //

-- Procedure: Identify Crime Hotspots
CREATE PROCEDURE sp_IdentifyHotspots(
    IN p_AnalystID VARCHAR(10),
    IN p_DaysBack INT,
    IN p_RadiusMeters INT
)
BEGIN
    -- This is a simplified version. Real implementation would use spatial functions
    INSERT INTO Hotspots (LocationID, AreaName, CrimeDensity, CrimeCount, RadiusMeters, 
                         RiskLevel, ComputedOn, ComputedBy)
    SELECT 
        l.LocationID,
        l.AreaName,
        COUNT(cr.CrimeID) / p_RadiusMeters * 1000 AS CrimeDensity,
        COUNT(cr.CrimeID) AS CrimeCount,
        p_RadiusMeters,
        CASE 
            WHEN COUNT(cr.CrimeID) >= 20 THEN 'Critical'
            WHEN COUNT(cr.CrimeID) >= 10 THEN 'High'
            WHEN COUNT(cr.CrimeID) >= 5 THEN 'Medium'
            ELSE 'Low'
        END AS RiskLevel,
        CURRENT_DATE,
        p_AnalystID
    FROM Location l
    LEFT JOIN CrimeRecord cr ON l.LocationID = cr.LocationID 
        AND cr.OccurredOn >= DATE_SUB(CURRENT_DATE, INTERVAL p_DaysBack DAY)
    GROUP BY l.LocationID, l.AreaName
    HAVING CrimeCount > 0
    ON DUPLICATE KEY UPDATE
        CrimeDensity = VALUES(CrimeDensity),
        CrimeCount = VALUES(CrimeCount),
        RiskLevel = VALUES(RiskLevel),
        ComputedBy = VALUES(ComputedBy);
END //

-- Procedure: Generate Crime Report
CREATE PROCEDURE sp_GenerateCrimeReport(
    IN p_AnalystID VARCHAR(10),
    IN p_ReportType VARCHAR(50),
    IN p_Title VARCHAR(200),
    IN p_StartDate DATE,
    IN p_EndDate DATE,
    IN p_FilterArea VARCHAR(100),
    IN p_FilterSeverity VARCHAR(20)
)
BEGIN
    DECLARE v_TotalCrimes INT;
    DECLARE v_AvgSafety DECIMAL(5,2);
    
    -- Count total crimes matching filters
    SELECT COUNT(*), COALESCE(AVG(ss.ScoreValue), 0)
    INTO v_TotalCrimes, v_AvgSafety
    FROM CrimeRecord cr
    JOIN Location l ON cr.LocationID = l.LocationID
    LEFT JOIN SafetyScore ss ON l.AreaName = ss.AreaName 
        AND ss.ComputedOn = (SELECT MAX(ComputedOn) FROM SafetyScore WHERE AreaName = l.AreaName)
    WHERE cr.OccurredOn BETWEEN p_StartDate AND p_EndDate
    AND (p_FilterArea IS NULL OR l.AreaName = p_FilterArea)
    AND (p_FilterSeverity IS NULL OR cr.Severity = p_FilterSeverity);
    
    -- Insert report record
    INSERT INTO Reports (Title, Type, StartDate, EndDate, FilterArea, FilterSeverity,
                        TotalCrimes, AverageSafetyScore, AnalystID)
    VALUES (p_Title, p_ReportType, p_StartDate, p_EndDate, p_FilterArea, p_FilterSeverity,
            v_TotalCrimes, v_AvgSafety, p_AnalystID);
    
    SELECT LAST_INSERT_ID() AS ReportID, v_TotalCrimes AS TotalCrimes, v_AvgSafety AS AvgSafetyScore;
END //

-- Procedure: Search Crimes with Filters
CREATE PROCEDURE sp_SearchCrimes(
    IN p_AreaName VARCHAR(100),
    IN p_CrimeType VARCHAR(50),
    IN p_Severity VARCHAR(20),
    IN p_StartDate DATE,
    IN p_EndDate DATE,
    IN p_Limit INT
)
BEGIN
    SELECT 
        cr.CrimeID,
        cr.Type,
        cr.Severity,
        cr.Description,
        cr.OccurredOn,
        cr.OccurredTime,
        l.AreaName,
        l.Address,
        l.Latitude,
        l.Longitude,
        cc.CategoryName,
        u.Name AS ReportedByName
    FROM CrimeRecord cr
    JOIN Location l ON cr.LocationID = l.LocationID
    JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
    LEFT JOIN User u ON cr.ReportedBy = u.UserID
    WHERE (p_AreaName IS NULL OR l.AreaName = p_AreaName)
    AND (p_CrimeType IS NULL OR cr.Type LIKE CONCAT('%', p_CrimeType, '%'))
    AND (p_Severity IS NULL OR cr.Severity = p_Severity)
    AND (p_StartDate IS NULL OR cr.OccurredOn >= p_StartDate)
    AND (p_EndDate IS NULL OR cr.OccurredOn <= p_EndDate)
    AND cr.Status = 'Active'
    ORDER BY cr.OccurredOn DESC
    LIMIT p_Limit;
END //

-- Procedure: Get Safety Score Trend for Area
CREATE PROCEDURE sp_GetSafetyTrend(
    IN p_AreaName VARCHAR(100),
    IN p_DaysBack INT
)
BEGIN
    SELECT 
        ComputedOn,
        ScoreValue,
        CrimeCount,
        HighSeverityCount,
        CASE 
            WHEN ScoreValue >= 80 THEN 'Safe'
            WHEN ScoreValue >= 60 THEN 'Moderate'
            WHEN ScoreValue >= 40 THEN 'Risky'
            ELSE 'Dangerous'
        END AS RiskCategory
    FROM SafetyScore
    WHERE AreaName = p_AreaName
    AND ComputedOn >= DATE_SUB(CURRENT_DATE, INTERVAL p_DaysBack DAY)
    ORDER BY ComputedOn ASC;
END //

-- Procedure: Batch Update Area Statistics
CREATE PROCEDURE sp_RefreshAllAreaStats()
BEGIN
    TRUNCATE TABLE AreaStatistics;
    
    INSERT INTO AreaStatistics (AreaName, TotalCrimes, CrimesLastMonth, CrimesLastYear,
                                HighSeverityCrimes, MostCommonCrimeType, CurrentSafetyScore)
    SELECT 
        l.AreaName,
        COUNT(cr.CrimeID) AS TotalCrimes,
        SUM(CASE WHEN cr.OccurredOn >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS CrimesLastMonth,
        SUM(CASE WHEN cr.OccurredOn >= DATE_SUB(CURRENT_DATE, INTERVAL 365 DAY) THEN 1 ELSE 0 END) AS CrimesLastYear,
        SUM(CASE WHEN cr.Severity = 'High' THEN 1 ELSE 0 END) AS HighSeverityCrimes,
        (SELECT Type FROM CrimeRecord cr2 
         JOIN Location l2 ON cr2.LocationID = l2.LocationID 
         WHERE l2.AreaName = l.AreaName 
         GROUP BY Type ORDER BY COUNT(*) DESC LIMIT 1) AS MostCommonCrimeType,
        (SELECT ScoreValue FROM SafetyScore ss 
         WHERE ss.AreaName = l.AreaName 
         ORDER BY ComputedOn DESC LIMIT 1) AS CurrentSafetyScore
    FROM Location l
    LEFT JOIN CrimeRecord cr ON l.LocationID = cr.LocationID
    GROUP BY l.AreaName;
END //

-- Procedure: Delete User Account (with cascading cleanup)
CREATE PROCEDURE sp_DeleteUserAccount(
    IN p_UserID VARCHAR(10),
    IN p_AdminID VARCHAR(10)
)
BEGIN
    DECLARE v_Role VARCHAR(20);
    
    START TRANSACTION;
    
    -- Check user role
    SELECT Role INTO v_Role FROM User WHERE UserID = p_UserID;
    
    IF v_Role IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
    END IF;
    
    -- Log the deletion
    INSERT INTO CrimeAuditLog (EntityType, EntityID, Action, PerformedBy, ChangeReason)
    VALUES ('User', p_UserID, 'DELETE', p_AdminID, CONCAT('User account deleted: ', p_UserID));
    
    -- Soft delete: deactivate instead of hard delete
    UPDATE User SET IsActive = FALSE WHERE UserID = p_UserID;
    
    COMMIT;
END //

DELIMITER ;

-- ============================================
-- FUNCTIONS
-- ============================================

DELIMITER //

-- Function: Calculate distance between two coordinates (Haversine formula)
CREATE FUNCTION fn_CalculateDistance(
    lat1 DECIMAL(9,6), lon1 DECIMAL(9,6),
    lat2 DECIMAL(9,6), lon2 DECIMAL(9,6)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE R INT DEFAULT 6371; -- Earth radius in km
    DECLARE dLat DECIMAL(10,8);
    DECLARE dLon DECIMAL(10,8);
    DECLARE a DECIMAL(10,8);
    DECLARE c DECIMAL(10,8);
    
    SET dLat = RADIANS(lat2 - lat1);
    SET dLon = RADIANS(lon2 - lon1);
    
    SET a = SIN(dLat/2) * SIN(dLat/2) +
            COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
            SIN(dLon/2) * SIN(dLon/2);
    
    SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c; -- Distance in km
END //

-- Function: Get Risk Level from Safety Score
CREATE FUNCTION fn_GetRiskLevel(p_SafetyScore INT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    RETURN CASE 
        WHEN p_SafetyScore >= 80 THEN 'Safe'
        WHEN p_SafetyScore >= 60 THEN 'Moderate'
        WHEN p_SafetyScore >= 40 THEN 'Risky'
        ELSE 'Dangerous'
    END;
END //

-- Function: Get Crime Count in Radius
CREATE FUNCTION fn_GetCrimeCountInRadius(
    p_Latitude DECIMAL(9,6),
    p_Longitude DECIMAL(9,6),
    p_RadiusKm DECIMAL(5,2),
    p_DaysBack INT
)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_Count INT;
    
    SELECT COUNT(*) INTO v_Count
    FROM CrimeRecord cr
    JOIN Location l ON cr.LocationID = l.LocationID
    WHERE fn_CalculateDistance(p_Latitude, p_Longitude, l.Latitude, l.Longitude) <= p_RadiusKm
    AND cr.OccurredOn >= DATE_SUB(CURRENT_DATE, INTERVAL p_DaysBack DAY)
    AND cr.Status = 'Active';
    
    RETURN v_Count;
END //

-- Function: Check if User is Admin
CREATE FUNCTION fn_IsAdmin(p_UserID VARCHAR(10))
RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE v_Role VARCHAR(20);
    SELECT Role INTO v_Role FROM User WHERE UserID = p_UserID AND IsActive = TRUE;
    RETURN v_Role = 'Admin';
END //

-- Function: Get Latest Safety Score for Area
CREATE FUNCTION fn_GetLatestSafetyScore(p_AreaName VARCHAR(100))
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_Score INT;
    
    SELECT ScoreValue INTO v_Score
    FROM SafetyScore
    WHERE AreaName = p_AreaName
    ORDER BY ComputedOn DESC
    LIMIT 1;
    
    RETURN COALESCE(v_Score, 50); -- Default to 50 if no score exists
END //

DELIMITER ;

-- ============================================
-- ADDITIONAL CONSTRAINTS
-- ============================================

-- Remove the problematic CHECK constraints
-- ALTER TABLE CrimeRecord DROP CONSTRAINT chk_crime_date_not_future;
-- ALTER TABLE CitizenReports DROP CONSTRAINT chk_report_date_not_future;
-- ALTER TABLE SafetyScore DROP CONSTRAINT chk_score_date_not_future;

-- Create triggers instead
DELIMITER //

CREATE TRIGGER trg_ValidateCrimeDate
BEFORE INSERT ON CrimeRecord
FOR EACH ROW
BEGIN
    IF NEW.OccurredOn > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Crime occurrence date cannot be in the future';
    END IF;
END //

CREATE TRIGGER trg_ValidateCrimeDateUpdate
BEFORE UPDATE ON CrimeRecord
FOR EACH ROW
BEGIN
    IF NEW.OccurredOn > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Crime occurrence date cannot be in the future';
    END IF;
END //

CREATE TRIGGER trg_ValidateReportDate
BEFORE INSERT ON CitizenReports
FOR EACH ROW
BEGIN
    IF NEW.IncidentDate IS NOT NULL AND NEW.IncidentDate > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Incident date cannot be in the future';
    END IF;
END //

CREATE TRIGGER trg_ValidateReportDateUpdate
BEFORE UPDATE ON CitizenReports
FOR EACH ROW
BEGIN
    IF NEW.IncidentDate IS NOT NULL AND NEW.IncidentDate > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Incident date cannot be in the future';
    END IF;
END //

CREATE TRIGGER trg_ValidateSafetyScoreDate
BEFORE INSERT ON SafetyScore
FOR EACH ROW
BEGIN
    IF NEW.ComputedOn > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Safety score computation date cannot be in the future';
    END IF;
END //

DELIMITER ;


-- Ensure report date range is valid
ALTER TABLE Reports
ADD CONSTRAINT chk_report_date_range
CHECK (StartDate IS NULL OR EndDate IS NULL OR StartDate <= EndDate);

-- Ensure crime density is non-negative
ALTER TABLE Hotspots
ADD CONSTRAINT chk_crime_density_positive
CHECK (CrimeDensity >= 0);

-- ============================================
-- EVENTS (Scheduled Tasks)
-- ============================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event: Auto-refresh area statistics daily at midnight
CREATE EVENT evt_RefreshAreaStats
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
    CALL sp_RefreshAllAreaStats();

-- Event: Auto-reject old pending reports weekly
CREATE EVENT evt_CleanupOldReports
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
    UPDATE CitizenReports
    SET Status = 'Rejected',
        RejectionReason = 'Auto-rejected: Report older than 30 days',
        ReviewedOn = CURRENT_TIMESTAMP
    WHERE Status = 'Pending'
    AND DATEDIFF(CURRENT_DATE, SubmittedOn) > 30;

-- ============================================
-- END OF DDL
-- ============================================
-- Fix EntityID column to accept VARCHAR for User deletions

