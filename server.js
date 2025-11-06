import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// ✅ Basic route to test DB connection
app.get("/api/ping", async (req, res) => {
  const [rows] = await pool.query("SELECT NOW() AS now;");
  res.json(rows[0]);
});

app.get("/api/users", async (req, res) => {
  try {
    // ✅ Note: Use correct table name with backticks since 'User' can be a reserved word
    const [rows] = await pool.query("SELECT * FROM `User`");

    // ✅ Map SQL column names → frontend field names
    const formatted = rows.map((row) => ({
      id: row.UserID,
      name: row.Name,
      email: row.Email,
      role: row.Role.toLowerCase(), // "Admin" → "admin"
      status: row.IsActive ? "active" : "inactive",
      reportsCount: 0, // placeholder; if you have a crimes table you can link later
      createdAt: new Date(row.CreatedAt).toLocaleDateString(),
      lastActive: row.LastLogin
        ? new Date(row.LastLogin).toLocaleString()
        : "N/A",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ✅ Fetch all citizen reports with reporter info
app.get("/api/citizen-reports", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        cr.PublicReportID AS id,
        cr.CrimeType AS type,
        cr.Description AS description,
        cr.Severity AS severity,
        cr.Status AS status,
        cr.IncidentDate AS date,
        cr.IncidentTime AS time,
        u.Name AS reportedBy,
        u.UserID AS reportedById, 
        l.AreaName AS location,  -- ✓ Added comma here
        cr.SubmittedOn AS submittedOn
      FROM CitizenReports cr
      JOIN User u ON cr.UserID = u.UserID
      JOIN Location l ON cr.LocationID = l.LocationID
      ORDER BY cr.SubmittedOn DESC;
    `);

    // ✅ Map to your frontend structure
    const formatted = rows.map((r) => ({
      id: String(r.id),
      type: r.type || "Unknown",
      location: r.location || "Unknown Location",
      date: r.date ? new Date(r.date).toISOString().split("T")[0] : "N/A",
      time: r.time || "N/A",
      severity: r.severity ? r.severity.toLowerCase() : "low",
      description: r.description,
      reportedBy: r.reportedBy,
      reportedById: r.reportedById,
      status: r.status ? r.status.toLowerCase() : "pending",
      witnesses: 0,
      caseNumber: `RPT-${r.id.toString().padStart(5, "0")}`,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching citizen reports:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});


// ✅ Run custom query (use cautiously)
app.post("/api/query", async (req, res) => {
  try {
    const { sql } = req.body;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Call stored procedure (with args)
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

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
