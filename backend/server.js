import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SALT_ROUNDS = 10;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now;");
    res.json({ status: "✅ Connected", timestamp: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

function generateUserId(role) {
  const prefix = role === 'Admin' ? 'ADM' : role === 'Analyst' ? 'ANL' : 'PUB';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required" });
    }

    const validRoles = ['Admin', 'Analyst', 'Public'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be Admin, Analyst, or Public" });
    }

    const [existing] = await pool.query('SELECT UserID FROM User WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = generateUserId(role);

    await pool.query(
      `INSERT INTO User (UserID, Name, Role, Email, Password, PhoneNumber, IsActive)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [userId, name, role, email, hashedPassword, phoneNumber || null]
    );

    res.status(201).json({
      message: "User registered successfully",
      userId,
      name,
      email,
      role
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [users] = await pool.query(
      `SELECT UserID, Name, Email, Password, Role, IsActive, PhoneNumber, CreatedAt
       FROM User WHERE Email = ? AND IsActive = TRUE`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    if (role && user.Role !== role) {
      return res.status(403).json({ error: `This account is not registered as ${role}` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    await pool.query('UPDATE User SET LastLogin = CURRENT_TIMESTAMP WHERE UserID = ?', [user.UserID]);

    const [crimeCount] = await pool.query('SELECT COUNT(*) as count FROM CitizenReports WHERE UserID = ?', [user.UserID]);
    const [verifiedCount] = await pool.query('SELECT COUNT(*) as count FROM CitizenReports WHERE UserID = ? AND Status = "Verified"', [user.UserID]);

    res.json({
      userId: String(user.UserID),
      name: String(user.Name),
      email: String(user.Email),
      role: String(user.Role),
      phoneNumber: String(user.PhoneNumber || ''),
      crimesReported: parseInt(crimeCount[0]?.count) || 0,
      verifiedReports: parseInt(verifiedCount[0]?.count) || 0,
      joinedDate: new Date(user.CreatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      lastLogin: new Date().toISOString(),
      message: "Login successful"
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// USER MANAGEMENT ENDPOINTS
// ============================================

// Get all users (for admin dashboard)
app.get("/api/users", async (req, res) => {
  try {
    const query = `
      SELECT 
        u.UserID,
        u.Name,
        u.Email,
        u.Role,
        u.IsActive,
        u.CreatedAt,
        u.LastLogin,
        COALESCE(cr.cnt, 0) AS reportsCount
      FROM \`User\` u
      LEFT JOIN (
        SELECT UserID, COUNT(*) AS cnt
        FROM CitizenReports
        GROUP BY UserID
      ) cr ON u.UserID = cr.UserID
      ORDER BY u.CreatedAt DESC
    `;

    const [rows] = await pool.query(query);

    const formatted = rows.map((row) => ({
      id: row.UserID,
      name: row.Name,
      email: row.Email,
      role: row.Role ? row.Role.toLowerCase() : "public",
      status: row.IsActive ? "active" : "suspended",
      reportsCount: Number(row.reportsCount || 0),
      createdAt: row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString() : "N/A",
      lastActive: row.LastLogin ? new Date(row.LastLogin).toLocaleString() : "N/A",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Get single user profile
app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.query(
      `SELECT UserID, Name, Email, Role, PhoneNumber, IsActive, CreatedAt, LastLogin
       FROM User WHERE UserID = ? AND IsActive = TRUE`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    const [crimeCount] = await pool.query('SELECT COUNT(*) as count FROM CitizenReports WHERE UserID = ?', [userId]);
    const [verifiedCount] = await pool.query('SELECT COUNT(*) as count FROM CitizenReports WHERE UserID = ? AND Status = "Verified"', [userId]);

    res.json({
      userId: user.UserID,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      phoneNumber: user.PhoneNumber,
      crimesReported: crimeCount[0].count,
      verifiedReports: verifiedCount[0].count,
      joinedDate: new Date(user.CreatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      lastLogin: user.LastLogin
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phoneNumber, email } = req.body;

    const [existing] = await pool.query('SELECT UserID FROM User WHERE UserID = ? AND IsActive = TRUE', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email) {
      const [emailCheck] = await pool.query('SELECT UserID FROM User WHERE Email = ? AND UserID != ?', [email, userId]);
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('Name = ?');
      values.push(name);
    }
    if (phoneNumber !== undefined) {
      updates.push('PhoneNumber = ?');
      values.push(phoneNumber);
    }
    if (email) {
      updates.push('Email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(userId);

    await pool.query(`UPDATE User SET ${updates.join(', ')}, UpdatedAt = CURRENT_TIMESTAMP WHERE UserID = ?`, values);

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Suspend user
app.put("/api/users/:userId/suspend", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [result] = await pool.query(`UPDATE User SET IsActive = FALSE WHERE UserID = ?`, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, status: 'suspended' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// Activate user
app.put("/api/users/:userId/activate", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [result] = await pool.query(`UPDATE User SET IsActive = TRUE WHERE UserID = ?`, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, status: 'active' });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// Delete user account (✅ USES STORED PROCEDURE)
app.delete("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminId } = req.body;

    await pool.query('CALL sp_DeleteUserAccount(?, ?)', [userId, adminId || userId]);

    res.json({ message: "Account deactivated successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Change password
app.put("/api/users/:userId/password", async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }

    const [users] = await pool.query('SELECT Password FROM User WHERE UserID = ? AND IsActive = TRUE', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, users[0].Password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await pool.query('UPDATE User SET Password = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE UserID = ?', [hashedPassword, userId]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's citizen reports
app.get("/api/users/:userId/reports", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        cr.PublicReportID,
        cr.CrimeType,
        cr.Severity,
        cr.Description,
        cr.IncidentDate,
        cr.IncidentTime,
        cr.Status,
        cr.SubmittedOn,
        l.AreaName as LocationName,
        l.Address,
        l.Latitude,
        l.Longitude
      FROM CitizenReports cr
      JOIN Location l ON cr.LocationID = l.LocationID
      WHERE cr.UserID = ?
      ORDER BY cr.SubmittedOn DESC
    `;
    
    const [results] = await pool.query(query, [userId]);
    
    const transformedData = results.map(row => ({
      id: row.PublicReportID,
      type: row.CrimeType,
      severity: row.Severity.toLowerCase(),
      description: row.Description,
      date: row.IncidentDate || row.SubmittedOn,
      time: row.IncidentTime || new Date(row.SubmittedOn).toLocaleTimeString(),
      location: row.LocationName,
      address: row.Address,
      latitude: row.Latitude,
      longitude: row.Longitude,
      caseNumber: String(row.PublicReportID).padStart(6, '0'),
      status: row.Status.toLowerCase() === 'rejected' ? 'discarded' : row.Status.toLowerCase(),
      submittedOn: row.SubmittedOn
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ error: 'Failed to fetch user reports' });
  }
});

// ============================================
// CITIZEN REPORTS ENDPOINTS
// ============================================

// Add this endpoint to your server.js

app.post("/api/citizen-reports", async (req, res) => {
  try {
    const {
      crimeType,
      categoryId,
      severity,
      description,
      incidentDate,
      incidentTime,
      userId,
      locationId
    } = req.body;

    console.log("📝 Received crime report:", req.body);

    // Insert citizen report
    const [reportResult] = await pool.query(
      `INSERT INTO CitizenReports 
       (CrimeType, CategoryID, Severity, Description, IncidentDate, IncidentTime, 
        Status, UserID, LocationID)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [crimeType, categoryId, severity, description, incidentDate, incidentTime, userId, locationId]
    );

    console.log("✅ Crime report inserted with ID:", reportResult.insertId);

    res.json({
      success: true,
      reportId: reportResult.insertId,
      message: "Crime report submitted successfully"
    });

  } catch (error) {
    console.error("❌ Error submitting crime report:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit crime report",
      details: error.message 
    });
  }
});

// Get available areas (locations) for dropdown
app.get("/api/locations", async (req, res) => {
  try {
    const [locations] = await pool.query(
      `SELECT LocationID, AreaName, Address, Latitude, Longitude 
       FROM Location 
       ORDER BY AreaName`
    );
    console.log("📍 Fetched locations:", locations.length);
    console.log("📍 First location sample:", locations[0]);
    res.json(locations);
  }catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Verify a citizen report (Admin action)
app.post("/api/crimes/:id/verify", async (req, res) => {
  const reportId = req.params.id;
  
  try {
    console.log("✅ Verifying report:", reportId);
    
    // Update the citizen report status to 'Verified'
    const [result] = await pool.query(
      `UPDATE CitizenReports 
       SET Status = 'Verified', 
           ReviewedBy = 'ADM001', 
           ReviewedOn = NOW() 
       WHERE PublicReportID = ?`,
      [reportId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    console.log("✅ Report verified successfully");
    res.json({ success: true, message: "Crime verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying crime:", error);
    res.status(500).json({ error: "Failed to verify crime" });
  }
});

// Discard a citizen report (Admin action)
app.post("/api/crimes/:id/discard", async (req, res) => {
  const reportId = req.params.id;
  
  try {
    console.log("🗑️ Discarding report:", reportId);
    
    // Update the citizen report status to 'Rejected'
    const [result] = await pool.query(
      `UPDATE CitizenReports 
       SET Status = 'Rejected', 
           ReviewedBy = 'ADM001', 
           ReviewedOn = NOW(),
           RejectionReason = 'Discarded by admin' 
       WHERE PublicReportID = ?`,
      [reportId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    console.log("✅ Report discarded successfully");
    res.json({ success: true, message: "Crime discarded successfully" });
  } catch (error) {
    console.error("❌ Error discarding crime:", error);
    res.status(500).json({ error: "Failed to discard crime" });
  }
});

// Get all citizen reports
app.get('/api/citizen-reports', async (req, res) => {
  try {
    const query = `
      SELECT 
        cr.PublicReportID,
        cr.CrimeType,
        cr.Severity,
        cr.Description,
        cr.IncidentDate,
        cr.IncidentTime,
        cr.Status,
        cr.SubmittedOn,
        u.Name as ReporterName,
        l.AreaName as LocationName,
        l.Address,
        l.Latitude,
        l.Longitude
      FROM CitizenReports cr
      JOIN User u ON cr.UserID = u.UserID
      JOIN Location l ON cr.LocationID = l.LocationID
      ORDER BY cr.SubmittedOn DESC
    `;
    
    const [results] = await pool.query(query);
    
    const transformedData = results.map(row => ({
      id: row.PublicReportID,
      type: row.CrimeType,
      severity: row.Severity.toLowerCase(),
      description: row.Description,
      date: row.IncidentDate || row.SubmittedOn,
      time: row.IncidentTime || new Date(row.SubmittedOn).toLocaleTimeString(),
      location: row.LocationName,
      address: row.Address,
      latitude: row.Latitude,
      longitude: row.Longitude,
      caseNumber: String(row.PublicReportID).padStart(6, '0'),
      reportedBy: row.ReporterName,
      status: row.Status.toLowerCase() === 'rejected' ? 'discarded' : row.Status.toLowerCase(),
      submittedOn: row.SubmittedOn
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching citizen reports:', error);
    res.status(500).json({ error: 'Failed to fetch citizen reports' });
  }
});

// Get single citizen report
app.get("/api/citizen-reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        cr.PublicReportID AS id,
        cr.CrimeType AS type,
        cr.Description AS description,
        cr.Severity AS severity,
        cr.Status AS status,
        cr.IncidentDate AS date,
        cr.IncidentTime AS time,
        u.Name AS reportedBy,
        u.Email AS email,
        u.PhoneNumber AS phone,
        u.UserID AS reportedById,
        COALESCE(l.AreaName, 'Unknown Location') AS location,
        l.Address AS address,
        l.Landmark AS landmark,
        l.Latitude AS latitude,
        l.Longitude AS longitude,
        cr.SubmittedOn AS submittedOn,
        cr.ReviewedBy AS reviewedBy,
        cr.ReviewedOn AS reviewedOn,
        cr.RejectionReason AS rejectionReason
      FROM CitizenReports cr
      LEFT JOIN User u ON cr.UserID = u.UserID
      LEFT JOIN Location l ON cr.LocationID = l.LocationID
      WHERE cr.PublicReportID = ?;`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Report not found" });

    const r = rows[0];
    
    const statusMap = {
      'Verified': 'verified',
      'Pending': 'pending',
      'Rejected': 'discarded'
    };

    res.json({
      id: String(r.id),
      type: r.type,
      description: r.description,
      severity: r.severity.toLowerCase(),
      status: statusMap[r.status] || r.status.toLowerCase(),
      date: r.date,
      time: r.time,
      reportedBy: r.reportedBy || "Unknown",
      email: r.email,
      phone: r.phone,
      location: r.location,
      address: r.address || "N/A",
      landmark: r.landmark,
      latitude: r.latitude,
      longitude: r.longitude,
      submittedOn: r.submittedOn,
      reviewedBy: r.reviewedBy,
      reviewedOn: r.reviewedOn,
      rejectionReason: r.rejectionReason,
      caseNumber: `RPT-${String(r.id).padStart(5, "0")}`,
    });
  } catch (err) {
    console.error("Error fetching report by ID:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ✅ FIXED: Update citizen report status using stored procedure
app.put("/api/citizen-reports/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminId, rejectionReason } = req.body;

    const statusMap = {
      'verified': 'VERIFY',
      'discarded': 'REJECT'
    };

    if (!['verified', 'discarded'].includes(status.toLowerCase())) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const action = statusMap[status.toLowerCase()];

    // Verify admin exists
    if (adminId) {
      const [admin] = await pool.query('SELECT Role FROM User WHERE UserID = ? AND IsActive = TRUE', [adminId]);
      if (admin.length === 0 || admin[0].Role !== 'Admin') {
        return res.status(403).json({ error: 'Only admins can verify/reject reports' });
      }
    }

    // ✅ Use stored procedure for proper audit trail and CrimeRecord creation
    await pool.query(
      'CALL sp_VerifyCitizenReport(?, ?, ?, ?)',
      [parseInt(id), adminId || 'ADM001', action, rejectionReason || null]
    );

    res.json({ 
      success: true, 
      newStatus: status.toLowerCase()
    });
  } catch (err) {
    console.error("Error updating report status:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit new citizen report
app.post("/api/citizen-reports", async (req, res) => {
  try {
    const {
      crimeType,
      categoryId,
      severity,
      description,
      incidentDate,
      incidentTime,
      userId,
      locationId
    } = req.body;

    console.log("📝 Received crime report:", req.body);

    const [reportResult] = await pool.query(
      `INSERT INTO CitizenReports 
       (CrimeType, CategoryID, Severity, Description, IncidentDate, IncidentTime, 
        Status, UserID, LocationID)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [crimeType, categoryId, severity, description, incidentDate, incidentTime, userId, locationId]
    );

    console.log("✅ Crime report inserted with ID:", reportResult.insertId);

    res.json({
      success: true,
      reportId: reportResult.insertId,
      message: "Crime report submitted successfully"
    });

  } catch (error) {
    console.error("❌ Error submitting crime report:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit crime report",
      details: error.message 
    });
  }
});

// Get crime categories
app.get("/api/crime-categories", async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT CategoryID, CategoryName, Description FROM CrimeCategory ORDER BY CategoryName"
    );
    console.log("📋 Fetched categories:", categories.length);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch crime categories" });
  }
});

// Get crime types by category
app.get("/api/crime-types/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const [types] = await pool.query(
      `SELECT DISTINCT CrimeType 
       FROM CrimeRecord 
       WHERE CategoryID = ? 
       ORDER BY CrimeType`,
      [categoryId]
    );
    
    res.json(types);
  } catch (error) {
    console.error("Error fetching crime types:", error);
    res.status(500).json({ error: "Failed to fetch crime types" });
  }
});

// ============================================
// CRIME RECORDS ENDPOINTS (CrimeRecord table)
// ============================================

app.get("/api/crimes", async (req, res) => {
  try {
    const { type, severity, status } = req.query;

    let query = `
      SELECT 
        cr.CrimeID as id,
        cr.Type as type,
        cr.Severity as severity,
        cr.Description as description,
        DATE(cr.OccurredOn) as date,
        cr.OccurredTime as time,
        l.AreaName as location,
        l.Address as address,
        l.Latitude as latitude,
        l.Longitude as longitude,
        cc.CategoryName as category,
        cr.Status as status,
        cr.ReportedBy as reportedBy,
        cr.CrimeID as caseNumber
      FROM CrimeRecord cr
      JOIN Location l ON cr.LocationID = l.LocationID
      JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
      WHERE 1=1
    `;

    const params = [];

    if (type && type !== 'all') {
      query += ` AND LOWER(cr.Type) = LOWER(?)`;
      params.push(type);
    }

    if (severity && severity !== 'all') {
      query += ` AND LOWER(cr.Severity) = LOWER(?)`;
      params.push(severity);
    }

    if (status && status !== 'all') {
      if (status.toLowerCase() === 'active') {
        query += ` AND cr.Status = 'Active'`;
      } else if (status.toLowerCase() === 'resolved') {
        query += ` AND cr.Status = 'Resolved'`;
      } else if (status.toLowerCase() === 'under investigation') {
        query += ` AND cr.Status = 'Under Investigation'`;
      }
    }

    query += ` ORDER BY cr.OccurredOn DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/crimes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        cr.CrimeID as id,
        cr.Type as type,
        cr.Severity as severity,
        cr.Description as description,
        DATE(cr.OccurredOn) as date,
        cr.OccurredTime as time,
        l.AreaName as location,
        l.Address as address,
        l.Latitude as latitude,
        l.Longitude as longitude,
        cc.CategoryName as category,
        cr.Status as status,
        cr.VerifiedBy as verifiedBy,
        cr.CrimeID as caseNumber,
        cr.ReportedBy as reportedBy
       FROM CrimeRecord cr
       JOIN Location l ON cr.LocationID = l.LocationID
       JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
       WHERE cr.CrimeID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Crime not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/crimes-types", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT Type FROM CrimeRecord ORDER BY Type`
    );
    res.json(rows.map((r) => r.Type));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// ✅ Safety Score - Require Analyst/Admin
app.get("/api/analytics/safety-score/:areaName", async (req, res) => {
  try {
    const { areaName } = req.params;
    const { analystId, daysBack = 30 } = req.query;

    if (!analystId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify user exists and is Analyst or Admin
    const [user] = await pool.query('SELECT Role FROM User WHERE UserID = ? AND IsActive = TRUE', [analystId]);
    if (user.length === 0 || !['Analyst', 'Admin'].includes(user[0].Role)) {
      return res.status(403).json({ error: 'Access denied. Must be Analyst or Admin' });
    }

    // Calculate using stored procedure
    await pool.query(
      'CALL sp_CalculateSafetyScore(?, ?, ?)',
      [areaName, analystId, parseInt(daysBack)]
    );

    // Retrieve the saved score
    const [result] = await pool.query(
      `SELECT ScoreValue, CrimeCount, HighSeverityCount,
              CASE 
                WHEN ScoreValue >= 70 THEN 'Low'
                WHEN ScoreValue >= 40 THEN 'Medium'
                ELSE 'High'
              END AS RiskLevel
       FROM SafetyScore
       WHERE AreaName = ?
       ORDER BY ComputedOn DESC
       LIMIT 1`,
      [areaName]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Area not found or no data available' });
    }

    const score = result[0];
    res.json({
      areaName,
      safetyScore: score.ScoreValue,
      crimeCount: score.CrimeCount,
      highSeverity: score.HighSeverityCount,
      mediumSeverity: 0,
      lowSeverity: score.CrimeCount - score.HighSeverityCount,
      riskLevel: score.RiskLevel
    });
  } catch (err) {
    console.error("Safety score error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/analytics/dashboard-summary", async (req, res) => {
  try {
    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN Status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN Status = 'Under Investigation' THEN 1 ELSE 0 END) AS investigating,
        SUM(CASE WHEN Severity = 'High' THEN 1 ELSE 0 END) AS highSeverity
       FROM CrimeRecord`
    );

    res.json({
      total: summary[0].total || 0,
      active: summary[0].active || 0,
      resolved: summary[0].resolved || 0,
      investigating: summary[0].investigating || 0,
      highSeverity: summary[0].highSeverity || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Generate Report - Require Analyst/Admin
app.post("/api/analytics/generate-report", async (req, res) => {
  try {
    const { title, type, startDate, endDate, filterArea, filterSeverity, analystId } = req.body;

    if (!title || !type || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!analystId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Verify user exists and is Analyst or Admin
    const [user] = await pool.query('SELECT Role FROM User WHERE UserID = ? AND IsActive = TRUE', [analystId]);
    if (user.length === 0 || !['Analyst', 'Admin'].includes(user[0].Role)) {
      return res.status(403).json({ error: 'Access denied. Must be Analyst or Admin' });
    }

    const [result] = await pool.query(
      'CALL sp_GenerateCrimeReport(?, ?, ?, ?, ?, ?, ?)',
      [analystId, type, title, startDate, endDate, filterArea || null, filterSeverity || null]
    );

    const reportData = result[0][0];

    res.json({
      ReportID: reportData.ReportID,
      message: "Report generated successfully",
      title,
      type,
      totalCrimes: reportData.TotalCrimes,
      averageSafetyScore: reportData.AvgSafetyScore,
      startDate,
      endDate,
      filterArea
    });
  } catch (err) {
    console.error("Generate report error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Generate Hotspot Map - Require Analyst/Admin
app.post("/api/analytics/generate-map", async (req, res) => {
  try {
    const { analystId, daysBack = 30, radiusMeters = 500 } = req.body;

    if (!analystId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Verify user
    const [user] = await pool.query('SELECT Role FROM User WHERE UserID = ? AND IsActive = TRUE', [analystId]);
    if (user.length === 0 || !['Analyst', 'Admin'].includes(user[0].Role)) {
      return res.status(403).json({ error: 'Access denied. Must be Analyst or Admin' });
    }

    await pool.query(
      'CALL sp_IdentifyHotspots(?, ?, ?)',
      [analystId, parseInt(daysBack), parseInt(radiusMeters)]
    );

    const [hotspots] = await pool.query(
      `SELECT h.AreaName as area, h.CrimeCount as crimeCount,
              l.Latitude as latitude, l.Longitude as longitude, h.RiskLevel
       FROM Hotspots h
       JOIN Location l ON h.LocationID = l.LocationID
       WHERE h.ComputedOn = CURRENT_DATE
       ORDER BY h.CrimeCount DESC`
    );

    res.json({
      message: "Map data generated successfully",
      hotspots
    });
  } catch (err) {
    console.error("Generate map error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// LEGACY/UTILITY ENDPOINTS
// ============================================

app.get("/api/reports", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Reports ORDER BY GeneratedAt DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

app.post("/api/query", async (req, res) => {
  try {
    const { sql } = req.body;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/procedure/:name", async (req, res) => {
  try {
    const procName = req.params.name;
    const { params = [] } = req.body;
    const [rows] = await pool.query(`CALL ${procName}(${params.map(() => "?").join(",")})`, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ============================================
// START SERVER
// ============================================

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
