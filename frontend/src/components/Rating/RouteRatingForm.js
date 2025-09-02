import React, { useState } from 'react';
import { FiStar, FiX, FiMapPin, FiClock, FiNavigation } from 'react-icons/fi';
import { ratingService } from '../../services/api';
import toast from 'react-hot-toast';

const RouteRatingForm = ({ currentLocation, destination, onClose }) => {
  const [formData, setFormData] = useState({
    safety_score: 0,
    comment: '',
    time_of_day: getCurrentTimeOfDay(),
    day_of_week: getCurrentDayOfWeek(),
    route_type: 'walking'
  });
  const [submitting, setSubmitting] = useState(false);

  function getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  function getCurrentDayOfWeek() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, safety_score: rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.safety_score === 0) {
      toast.error('Please select a safety rating');
      return;
    }

    if (!currentLocation) {
      toast.error('Current location is required');
      return;
    }

    setSubmitting(true);
    try {
      const ratingData = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        safety_score: formData.safety_score,
        comment: formData.comment.trim(),
        time_of_day: formData.time_of_day,
        day_of_week: formData.day_of_week,
        route_type: formData.route_type
      };

      await ratingService.rateRoute(ratingData);
                toast.success('Thank you for rating this location!');
      onClose();
    } catch (error) {
      console.error('Rating submission error:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors duration-200 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <FiStar 
              className={`w-8 h-8 ${star <= value ? 'fill-current' : ''}`} 
            />
          </button>
        ))}
      </div>
    );
  };

  const getSafetyLabel = (score) => {
    switch (score) {
      case 1: return 'Very Unsafe';
      case 2: return 'Unsafe';
      case 3: return 'Neutral';
      case 4: return 'Safe';
      case 5: return 'Very Safe';
      default: return 'Select Rating';
    }
  };

  const getSafetyColor = (score) => {
    switch (score) {
      case 1: return 'text-red-600';
      case 2: return 'text-orange-600';
      case 3: return 'text-yellow-600';
      case 4: return 'text-green-600';
      case 5: return 'text-green-700';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rate This Location</h3>
                      <p className="text-sm text-gray-600">Help other users stay safe</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <FiX className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Location Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-blue-700 mb-2">
          <FiMapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Current Location</span>
        </div>
        {currentLocation ? (
          <p className="text-sm text-blue-600">
            {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-red-600">Location not available</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Safety Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How safe do you feel at this location? <span className="text-red-500">*</span>
          </label>
          
          <div className="text-center">
            <StarRating 
              value={formData.safety_score} 
              onChange={handleStarClick}
            />
            <p className={`mt-2 text-sm font-medium ${getSafetyColor(formData.safety_score)}`}>
              {getSafetyLabel(formData.safety_score)}
            </p>
          </div>
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time of Day
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
                              { value: 'morning', label: 'Morning', icon: 'Dawn' },
              { value: 'afternoon', label: 'Afternoon', icon: 'Sun' },
                              { value: 'evening', label: 'Evening', icon: 'Dusk' },
              { value: 'night', label: 'Night', icon: 'Moon' }
            ].map((time) => (
              <button
                key={time.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, time_of_day: time.value }))}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                  formData.time_of_day === time.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span>{time.icon}</span>
                <span className="text-sm font-medium">{time.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Route Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How are you traveling?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
                    { value: 'walking', label: 'Walking', icon: 'Walk' },
      { value: 'cycling', label: 'Cycling', icon: 'Bike' },
      { value: 'driving', label: 'Driving', icon: 'Car' }
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, route_type: type.value }))}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                  formData.route_type === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="comment"
            rows={3}
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            className="input resize-none"
            placeholder="Share specific details about lighting, foot traffic, safety concerns, etc."
            maxLength={500}
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.comment.length}/500 characters
          </p>
        </div>

        {/* Context Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FiClock className="w-4 h-4" />
              <span className="capitalize">{formData.day_of_week}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiNavigation className="w-4 h-4" />
              <span className="capitalize">{formData.route_type}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || formData.safety_score === 0}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Rating...</span>
            </div>
          ) : (
            'Submit Safety Rating'
          )}
        </button>
      </form>

      {/* Privacy Note */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
            Your ratings help other users make informed safety decisions. 
            Location data is anonymized and only used for safety analysis.
          </p>
      </div>
    </div>
  );
};

export default RouteRatingForm; 