const nodemailer = require('nodemailer');
const { User } = require('../models');

// Create email transporter (configure based on your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendSOSAlert = async (req, res) => {
  try {
    const { lat, lng, message } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    const user = req.user;
    const emergencyContact = user?.emergency_contact || process.env.EMERGENCY_EMAIL;

    if (!emergencyContact) {
      return res.status(400).json({
        success: false,
        message: 'No emergency contact configured'
      });
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const timestamp = new Date().toLocaleString();

    const emailSubject = `🚨 EMERGENCY ALERT - ${user?.name || 'Safe Route User'}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #dc3545; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin: 0;">🚨 EMERGENCY ALERT</h2>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3>Emergency Alert Details:</h3>
          <p><strong>User:</strong> ${user?.name || 'Anonymous User'}</p>
          <p><strong>Email:</strong> ${user?.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${user?.phone || 'Not provided'}</p>
          <p><strong>Time:</strong> ${timestamp}</p>
          <p><strong>Location:</strong> ${lat}, ${lng}</p>
          
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          
          <div style="margin: 20px 0;">
            <a href="${googleMapsUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              📍 View Location on Map
            </a>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>⚠️ This is an automated emergency alert from the Safe Route Navigator app.</strong></p>
            <p style="margin: 5px 0 0 0;">Please check on the safety of this person immediately.</p>
          </div>
        </div>
      </div>
    `;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emergencyContact,
      subject: emailSubject,
      html: emailBody
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'SOS alert sent successfully',
      data: {
        timestamp,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        sentTo: emergencyContact
      }
    });

  } catch (error) {
    console.error('SOS alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SOS alert'
    });
  }
};

const shareLocation = async (req, res) => {
  try {
    const { lat, lng, duration = 60 } = req.body; // duration in minutes

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Store live location sharing in session/cache (simplified implementation)
    // In production, you'd use Redis or similar
    const shareId = Date.now().toString();
    const expiryTime = new Date(Date.now() + duration * 60 * 1000);

    // This would typically be stored in Redis or a cache
    global.liveLocations = global.liveLocations || {};
    global.liveLocations[shareId] = {
      userId: req.user?.id,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      startTime: new Date(),
      expiryTime,
      isActive: true
    };

    // Clean up expired shares (simple implementation)
    setTimeout(() => {
      if (global.liveLocations && global.liveLocations[shareId]) {
        delete global.liveLocations[shareId];
      }
    }, duration * 60 * 1000);

    const shareUrl = `${process.env.FRONTEND_URL}/live-location/${shareId}`;

    res.json({
      success: true,
      message: 'Location sharing started',
      data: {
        shareId,
        shareUrl,
        expiryTime,
        duration
      }
    });

  } catch (error) {
    console.error('Share location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start location sharing'
    });
  }
};

const getLiveLocation = async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!global.liveLocations || !global.liveLocations[shareId]) {
      return res.status(404).json({
        success: false,
        message: 'Live location share not found or expired'
      });
    }

    const locationData = global.liveLocations[shareId];

    if (new Date() > locationData.expiryTime || !locationData.isActive) {
      delete global.liveLocations[shareId];
      return res.status(410).json({
        success: false,
        message: 'Live location share has expired'
      });
    }

    res.json({
      success: true,
      data: {
        lat: locationData.lat,
        lng: locationData.lng,
        startTime: locationData.startTime,
        expiryTime: locationData.expiryTime,
        isActive: locationData.isActive
      }
    });

  } catch (error) {
    console.error('Get live location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get live location'
    });
  }
};

const updateLiveLocation = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    if (!global.liveLocations || !global.liveLocations[shareId]) {
      return res.status(404).json({
        success: false,
        message: 'Live location share not found'
      });
    }

    const locationData = global.liveLocations[shareId];

    if (new Date() > locationData.expiryTime) {
      delete global.liveLocations[shareId];
      return res.status(410).json({
        success: false,
        message: 'Live location share has expired'
      });
    }

    // Update location
    locationData.lat = parseFloat(lat);
    locationData.lng = parseFloat(lng);
    locationData.lastUpdate = new Date();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        lat: locationData.lat,
        lng: locationData.lng,
        lastUpdate: locationData.lastUpdate
      }
    });

  } catch (error) {
    console.error('Update live location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live location'
    });
  }
};

module.exports = {
  sendSOSAlert,
  shareLocation,
  getLiveLocation,
  updateLiveLocation
}; 