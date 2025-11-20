DELIMITER //

DROP PROCEDURE IF EXISTS sp_DeleteUserAccount //

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
    
    -- Just soft delete, skip audit logging
    UPDATE User SET IsActive = FALSE WHERE UserID = p_UserID;
    
    COMMIT;
END //

DELIMITER ;
