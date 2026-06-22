const express = require('express');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// MongoDB Connection
let usersCollection;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('smart-file-management');
    usersCollection = db.collection('users');
    console.log('Connected to MongoDB in login routes');
  } catch (error) {
    console.error('MongoDB connection error in login routes:', error);
  }
}

// Initialize database connection
connectToDatabase();

// Generate user ID
function generateUserId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Get the count of users for this month to generate sequential number
  return `${year}-USR-${month}-0001`; // Simplified for now, should query DB for actual count
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email (mock implementation - in production, use nodemailer or sendgrid)
async function sendOTP(email, otp) {
  console.log(`Sending OTP ${otp} to email ${email}`);
  // For demo purposes, just log it. In production, implement actual email sending
  // Example with nodemailer:
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Smart File Management',
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`
  });
  */
}

// Register endpoint - initiate registration with OTP
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP temporarily
    otpStore.set(email, {
      otp,
      expiry: otpExpiry,
      userData: { username, email, password }
    });

    // Send OTP
    await sendOTP(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent to your email. Please verify to complete registration.',
      // For development: include OTP in response
      devOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    // Check OTP
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP not found or expired' 
      });
    }

    if (storedData.expiry < new Date()) {
      otpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // OTP is valid, create user
    const { username, email: userEmail, password } = storedData.userData;
    const userId = generateUserId();

    // Hash password before storing
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = {
      userId,
      username,
      email: userEmail,
      password: hashedPassword, // Store hashed password
      createdAt: new Date(),
      isActive: true,
      emailVerified: true
    };

    await usersCollection.insertOne(newUser);

    // Clear OTP from store
    otpStore.delete(email);

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId, username, email: userEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      message: 'Registration successful!',
      token,
      user: {
        userId,
        username,
        email: userEmail
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during OTP verification' 
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user
    const user = await usersCollection.findOne({ 
      $or: [{ username }, { email: username }] 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password by hashing the input and comparing with stored hash
    const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedInputPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.userId, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      message: 'Login successful!',
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No registration in progress for this email' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP
    otpStore.set(email, {
      ...storedData,
      otp,
      expiry: otpExpiry
    });

    // Send new OTP
    await sendOTP(email, otp);

    res.json({ 
      success: true, 
      message: 'New OTP sent to your email.',
      devOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while resending OTP' 
    });
  }
});

module.exports = router;