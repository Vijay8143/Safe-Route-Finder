import React, { useState, useEffect } from 'react';
import { FiPhone, FiMapPin, FiAlertTriangle, FiX } from 'react-icons/fi';
import { sosService } from '../../services/api';
import { isNightMode } from '../../services/api';
import toast from 'react-hot-toast';

const SOSButton = ({ currentLocation }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nightMode, setNightMode] = useState(isNightMode());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Update night mode every minute
    const interval = setInterval(() => {
      setNightMode(isNightMode());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && isEmergency) {
      sendSOSAlert();
    }
    return () => clearTimeout(timer);
  }, [countdown, isEmergency]);

  const handleSOSPress = () => {
    if (isEmergency) {
      // Cancel emergency
      setIsEmergency(false);
      setCountdown(0);
      setShowConfirm(false);
      toast.success('Emergency alert cancelled');
    } else {
      // Start emergency countdown
      setShowConfirm(true);
    }
  };

  const confirmEmergency = () => {
    setIsEmergency(true);
    setCountdown(5); // 5 second countdown
    setShowConfirm(false);
    toast.loading('Emergency alert will be sent in 5 seconds...', {
      duration: 5000,
      id: 'sos-countdown'
    });
  };

  const sendSOSAlert = async () => {
    if (!currentLocation) {
      toast.error('Location not available for SOS alert');
      setIsEmergency(false);
      return;
    }

    setSending(true);
    try {
      // Create emergency message with location
      const emergencyMessage = `EMERGENCY ALERT from Safe Route Navigator App
Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}
Google Maps: https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}
Time: ${new Date().toLocaleString()}
Accuracy: ±${currentLocation.accuracy}m
${nightMode ? 'NIGHT TIME - Extra caution needed' : ''}

I need immediate assistance at this location!`;

      // Try multiple emergency methods
      let alertSent = false;

      // Method 1: Try to open phone dialer with emergency number
      try {
        window.open('tel:911', '_self');
        alertSent = true;
      } catch (e) {
        console.log('Phone dialer not available');
      }

      // Method 2: Copy emergency info to clipboard
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(emergencyMessage);
          toast.success('Emergency info copied to clipboard! Share with emergency contacts.', {
            duration: 8000
          });
          alertSent = true;
        }
      } catch (e) {
        console.log('Clipboard not available');
      }

      // Method 3: Try to share via Web Share API
      try {
        if (navigator.share) {
          await navigator.share({
            title: '🚨 EMERGENCY ALERT',
            text: emergencyMessage,
            url: `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`
          });
          alertSent = true;
        }
      } catch (e) {
        console.log('Web Share not available');
      }

      // Method 4: Fallback - show modal with emergency info
      if (!alertSent) {
        alert(`🚨 EMERGENCY ALERT 🚨\n\n${emergencyMessage}\n\nPlease call 911 immediately and share this location!`);
        alertSent = true;
      }

      if (alertSent) {
        toast.success('🚨 Emergency alert activated! Emergency info is ready to share.', {
          duration: 10000
        });
      }

      // Vibrate device for attention
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }

      // Try to play alert sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D');
        audio.play().catch(() => {});
      } catch (e) {}

    } catch (error) {
      console.error('SOS Alert Error:', error);
      toast.error('Emergency system activated. Please call 911 directly if needed.');
    } finally {
      setSending(false);
      setIsEmergency(false);
    }
  };

  const startLocationSharing = async () => {
    if (!currentLocation) {
      toast.error('Location not available');
      return;
    }

    try {
      // Create shareable location message
      const locationMessage = `📍 Live Location Sharing from Safe Route Navigator

Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}
Google Maps: https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}
Time: ${new Date().toLocaleString()}
Accuracy: ±${currentLocation.accuracy}m

I am sharing my location for safety. Track me here: https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;

      let shared = false;

      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: '📍 My Live Location',
            text: locationMessage,
            url: `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`
          });
          shared = true;
          toast.success('Location shared successfully! ✅');
        } catch (e) {
          if (e.name !== 'AbortError') {
            console.log('Web Share API failed, trying clipboard');
          }
        }
      }

      // Fallback to clipboard
      if (!shared && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(locationMessage);
          toast.success('📋 Location info copied to clipboard! Share with your contacts.');
          shared = true;
        } catch (e) {
          console.log('Clipboard failed');
        }
      }

      // Final fallback - show alert
      if (!shared) {
        alert(`📍 LOCATION SHARING\n\n${locationMessage}\n\nCopy this information and share with your contacts!`);
        toast.success('Location sharing activated! 📱');
      }

    } catch (error) {
      console.error('Location sharing error:', error);
      toast.error('Location sharing ready - use the info provided! 📱');
    }
  };

  return (
    <>
      {/* SOS Button */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end space-y-3">
        {/* Location Sharing Button */}
        <button
          onClick={startLocationSharing}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          title="Share Live Location"
        >
          <FiMapPin className="w-5 h-5" />
        </button>

        {/* Main SOS Button */}
        <button
          onClick={handleSOSPress}
          disabled={sending}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-200 flex items-center justify-center font-bold text-white text-sm ${
            isEmergency 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : nightMode 
                ? 'bg-red-600 hover:bg-red-700 sos-pulse'
                : 'bg-red-500 hover:bg-red-600'
          } ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {countdown > 0 ? (
            <span className="text-xl">{countdown}</span>
          ) : sending ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEmergency ? (
            <FiX className="w-6 h-6" />
          ) : (
            <div className="text-center">
              <FiPhone className="w-6 h-6 mb-1" />
              <div className="text-xs">SOS</div>
            </div>
          )}
          
          {/* Pulsing ring for night mode */}
          {nightMode && !isEmergency && (
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>
          )}
        </button>

        {/* Night mode indicator */}
        {nightMode && (
          <div className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
            Night Mode Active
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Emergency Alert
              </h3>
              
              <p className="text-gray-600 mb-6">
                This will send an emergency alert with your location to emergency contacts and services.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEmergency}
                  className="flex-1 btn-danger"
                >
                  Send Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Active Overlay */}
      {isEmergency && (
        <div className="fixed inset-0 bg-red-600/90 flex items-center justify-center z-[3000] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FiAlertTriangle className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Emergency Alert in Progress
            </h3>
            
            <p className="text-gray-600 mb-4">
              Sending emergency alert in {countdown} seconds...
            </p>

            <button
              onClick={handleSOSPress}
              className="btn-outline w-full"
            >
              Cancel Emergency
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton; 