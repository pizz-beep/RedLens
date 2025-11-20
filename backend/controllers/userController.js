const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      `SELECT UserID, UserName, Email, Password, Role FROM User WHERE Email = ?`,
      [email]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user.UserID, userEmail: user.Email, userName: user.UserName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.UserID,
        name: user.UserName,
        email: user.Email,
        role: user.Role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'analyst' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const connection = await pool.getConnection();
    
    // Check if user exists
    const [existingUsers] = await connection.execute(
      `SELECT UserID FROM User WHERE Email = ?`,
      [email]
    );
    
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const [result] = await connection.execute(
      `INSERT INTO User (UserName, Email, Password, Role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role]
    );
    connection.release();
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      `SELECT UserID, UserName, Email, Role FROM User WHERE UserID = ?`,
      [userId]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message });
  }
};
