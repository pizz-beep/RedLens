const pool = require('../config/database');

// Get all crimes with filters
exports.getCrimes = async (req, res) => {
  try {
    const { type, severity, status, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        cr.CrimeID as id,
        cr.Type as type,
        cr.Severity as severity,
        cr.Description as description,
        cr.OccurredOn as date,
        cr.OccurredTime as time,
        l.AreaName as location,
        l.Address as address,
        l.Latitude as latitude,
        l.Longitude as longitude,
        cc.CategoryName as category,
        cr.Status as status,
        cr.ReportedBy as reportedBy,
        cr.CaseNumber as caseNumber
      FROM CrimeRecord cr
      JOIN Location l ON cr.LocationID = l.LocationID
      JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
      WHERE 1=1
    `;
    
    const params = [];
    
    if (type && type !== 'all') {
      query += ` AND cr.Type = ?`;
      params.push(type);
    }
    
    if (severity && severity !== 'all') {
      query += ` AND cr.Severity = ?`;
      params.push(severity);
    }
    
    if (status && status !== 'all') {
      query += ` AND cr.Status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY cr.OccurredOn DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching crimes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get crime by ID
exports.getCrimeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT 
        cr.CrimeID as id,
        cr.Type as type,
        cr.Severity as severity,
        cr.Description as description,
        cr.OccurredOn as date,
        cr.OccurredTime as time,
        l.AreaName as location,
        l.Address as address,
        l.Latitude as latitude,
        l.Longitude as longitude,
        cc.CategoryName as category,
        cr.Status as status,
        cr.Witnesses as witnesses,
        cr.CaseNumber as caseNumber,
        cr.ReportedBy as reportedBy
       FROM CrimeRecord cr
       JOIN Location l ON cr.LocationID = l.LocationID
       JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
       WHERE cr.CrimeID = ?`,
      [id]
    );
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Crime not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching crime:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get crimes by location
exports.getCrimesByLocation = async (req, res) => {
  try {
    const { areaName } = req.params;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT 
        cr.CrimeID as id,
        cr.Type as type,
        cr.Severity as severity,
        cr.Description as description,
        cr.OccurredOn as date,
        cr.OccurredTime as time,
        l.AreaName as location,
        l.Address as address,
        l.Latitude as latitude,
        l.Longitude as longitude,
        cc.CategoryName as category,
        cr.Status as status,
        cr.Witnesses as witnesses,
        cr.CaseNumber as caseNumber
       FROM CrimeRecord cr
       JOIN Location l ON cr.LocationID = l.LocationID
       JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
       WHERE l.AreaName = ? 
       ORDER BY cr.OccurredOn DESC`,
      [areaName]
    );
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching crimes by location:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get crimes by date range
exports.getCrimesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT 
        cr.CrimeID as id,
        cr.Type as type,
        cr.Severity as severity,
        cr.Description as description,
        cr.OccurredOn as date,
        cr.OccurredTime as time,
        l.AreaName as location,
        l.Address as address,
        l.Latitude as latitude,
        l.Longitude as longitude,
        cc.CategoryName as category,
        cr.Status as status,
        cr.Witnesses as witnesses,
        cr.CaseNumber as caseNumber
       FROM CrimeRecord cr
       JOIN Location l ON cr.LocationID = l.LocationID
       JOIN CrimeCategory cc ON cr.CategoryID = cc.CategoryID
       WHERE cr.OccurredOn BETWEEN ? AND ?
       ORDER BY cr.OccurredOn DESC`,
      [startDate, endDate]
    );
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching crimes by date range:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new crime
exports.createCrime = async (req, res) => {
  try {
    const { type, categoryId, severity, description, occurredOn, occurredTime, locationId, witnesses } = req.body;
    const userId = req.userId;
    
    if (!type || !categoryId || !severity || !description || !occurredOn || !locationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO CrimeRecord 
       (Type, CategoryID, Severity, Description, OccurredOn, OccurredTime, ReportedBy, LocationID, Status, Witnesses)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
      [type, categoryId, severity, description, occurredOn, occurredTime || '00:00', userId, locationId, witnesses || 0]
    );
    connection.release();
    
    res.status(201).json({ 
      crimeId: result.insertId,
      message: 'Crime record created successfully'
    });
  } catch (error) {
    console.error('Error creating crime:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update crime
exports.updateCrime = async (req, res) => {
  try {
    const { id } = req.params;
    const { severity, status, description } = req.body;
    
    if (!severity || !status || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `UPDATE CrimeRecord SET Severity = ?, Status = ?, Description = ? WHERE CrimeID = ?`,
      [severity, status, description, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Crime not found' });
    }
    
    res.json({ message: 'Crime record updated successfully' });
  } catch (error) {
    console.error('Error updating crime:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all locations
exports.getLocations = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT LocationID as id, AreaName as location, Address as address, Latitude as latitude, Longitude as longitude
       FROM Location`
    );
    connection.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all crime types
exports.getCrimeTypes = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT DISTINCT Type FROM CrimeRecord ORDER BY Type`
    );
    connection.release();
    
    res.json(rows.map(r => r.Type));
  } catch (error) {
    console.error('Error fetching crime types:', error);
    res.status(500).json({ error: error.message });
  }
};
