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
    DECLARE v_MediumSeverity INT DEFAULT 0;
    DECLARE v_LowSeverity INT DEFAULT 0;
    DECLARE v_SafetyScore INT DEFAULT 50;

    -- More aggressive weights
    DECLARE w_high INT DEFAULT 10;   -- Each high severity kills 8 points!
    DECLARE w_med INT DEFAULT 4;    -- Each medium 4 points
    DECLARE w_low INT DEFAULT 2;    -- Each low 2 points

    SELECT LocationID INTO v_LocationID
    FROM Location
    WHERE AreaName = p_AreaName
    LIMIT 1;

    IF v_LocationID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Area not found';
    END IF;

    SELECT 
        COUNT(*) AS TotalCrimes,
        SUM(CASE WHEN Severity = 'High' THEN 1 ELSE 0 END) AS HighSeverity,
        SUM(CASE WHEN Severity = 'Medium' THEN 1 ELSE 0 END) AS MedSeverity,
        SUM(CASE WHEN Severity = 'Low' THEN 1 ELSE 0 END) AS LowSeverity
    INTO v_TotalCrimes, v_HighSeverity, v_MediumSeverity, v_LowSeverity
    FROM CrimeRecord cr
    JOIN Location l ON cr.LocationID = l.LocationID
    WHERE l.AreaName = p_AreaName
      AND cr.OccurredOn >= DATE_SUB(CURRENT_DATE, INTERVAL p_DaysBack DAY)
      AND cr.Status IN ('Active', 'Verified');

    SET v_SafetyScore = GREATEST(0, LEAST(100, 100 
        - (w_high * COALESCE(v_HighSeverity, 0))
        - (w_med  * COALESCE(v_MediumSeverity,0))
        - (w_low  * COALESCE(v_LowSeverity,0))
    ));

    INSERT INTO SafetyScore (
        LocationID, AreaName, ScoreValue, CrimeCount, HighSeverityCount, ComputedOn, ComputedBy
    )
    VALUES (
        v_LocationID, p_AreaName, v_SafetyScore, v_TotalCrimes, v_HighSeverity, CURRENT_DATE, p_AnalystID
    )
    ON DUPLICATE KEY UPDATE
        ScoreValue = v_SafetyScore,
        CrimeCount = v_TotalCrimes,
        HighSeverityCount = v_HighSeverity,
        ComputedBy = p_AnalystID,
        UpdatedAt = CURRENT_TIMESTAMP;

END //
DELIMITER ;
