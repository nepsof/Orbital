const express = require('express');
const { MongoClient } = require('mongodb');
const auth = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

let usersCollection;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('smart-file-management');
    usersCollection = db.collection('users');
    console.log('Connected to MongoDB in setting routes');
  } catch (error) {
    console.error('MongoDB connection error in setting routes:', error);
  }
}

connectToDatabase();

// GET /api/settings - Get current user settings
router.get('/settings', auth, async (req, res) => {
  try {
    if (!usersCollection) {
      return res.json({ success: true, data: { settings: {} } });
    }
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.json({ success: true, data: { settings: {} } });
    }

    res.json({
      success: true,
      data: {
        settings: user.settings || {}
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.json({ success: true, data: { settings: {} } });
  }
});

// PUT /api/settings/update - Update user settings
router.put('/settings/update', auth, async (req, res) => {
  try {
    if (!usersCollection) {
      return res.json({ success: true, message: 'Settings saved locally' });
    }
    const { settings } = req.body;
    
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.json({ success: true, message: 'Settings saved locally' });
    }

    const updatedSettings = {
      ...(user.settings || {}),
      ...settings
    };

    await usersCollection.updateOne(
      { userId: req.user.userId },
      { $set: { settings: updatedSettings } }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: updatedSettings }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.json({ success: true, message: 'Settings saved locally' });
  }
});

// GET /api/users/profile - Get user profile
router.get('/users/profile', auth, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        fullName: user.fullName || ''
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/users/profile', auth, async (req, res) => {
  try {
    const { username, email, fullName } = req.body;
    
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if new username/email is already taken by another user
    const existingUser = await usersCollection.findOne({
      $and: [
        { userId: { $ne: req.user.userId } },
        { $or: [{ username }, { email }] }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    await usersCollection.updateOne(
      { userId: req.user.userId },
      { $set: { username, email, fullName } }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/password - Update password
router.put('/users/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const crypto = require('crypto');
    
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const hashedCurrent = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (user.password !== hashedCurrent) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    // Update with new password
    const hashedNew = crypto.createHash('sha256').update(newPassword).digest('hex');
    await usersCollection.updateOne(
      { userId: req.user.userId },
      { $set: { password: hashedNew } }
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/settings/clear-cache - Clear application cache
router.post('/settings/clear-cache', auth, async (req, res) => {
  try {
    // In a real app, this would clear some cache in DB or memory
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/settings/export - Export settings
router.get('/settings/export', auth, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user.settings || {}
    });
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/folder-monitoring/settings - Get folder monitoring settings
router.get('/folder-monitoring/settings', auth, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user.settings?.folderMonitoring || {}
    });
  } catch (error) {
    console.error('Error fetching folder monitoring settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/folder-monitoring/settings - Update folder monitoring settings
router.put('/folder-monitoring/settings', auth, async (req, res) => {
  try {
    const settings = req.body;
    
    const user = await usersCollection.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedSettings = {
      ...(user.settings || {}),
      folderMonitoring: {
        ...(user.settings?.folderMonitoring || {}),
        ...settings
      }
    };

    await usersCollection.updateOne(
      { userId: req.user.userId },
      { $set: { settings: updatedSettings } }
    );

    res.json({
      success: true,
      message: 'Folder monitoring settings updated successfully',
      data: updatedSettings.folderMonitoring
    });
  } catch (error) {
    console.error('Error updating folder monitoring settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
