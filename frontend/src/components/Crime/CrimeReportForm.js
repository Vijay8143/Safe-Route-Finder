import React, { useState } from 'react';
import { FiAlertTriangle, FiX, FiMapPin, FiClock } from 'react-icons/fi';
import { crimeService } from '../../services/api';
import toast from 'react-hot-toast';

const CrimeReportForm = ({ currentLocation, onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    severity: '',
    incident_date: new Date().toISOString().slice(0, 16), // Current datetime
    lat: currentLocation?.lat || '',
    lng: currentLocation?.lng || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const crimeCategories = [
    { value: 'theft', label: 'Theft', icon: '🎒', description: 'Purse snatching, pickpocketing, etc.' },
    { value: 'robbery', label: 'Robbery', icon: '💰', description: 'Armed robbery, mugging' },
    { value: 'assault', label: 'Assault', icon: '⚠️', description: 'Physical violence or threats' },
    { value: 'harassment', label: 'Harassment', icon: '😰', description: 'Verbal abuse, catcalling, stalking' },
    { value: 'vandalism', label: 'Vandalism', icon: '🔨', description: 'Property damage, graffiti' },
    { value: 'other', label: 'Other', icon: '❗', description: 'Other safety concerns' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800', description: 'Minor incident, no immediate danger' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Concerning incident, some risk' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', description: 'Serious incident, significant danger' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800', description: 'Very serious, immediate danger to others' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('Please select a crime category');
      return;
    }

    if (!formData.severity) {
      toast.error('Please select severity level');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!formData.lat || !formData.lng) {
      toast.error('Location is required');
      return;
    }

    setSubmitting(true);
    try {
      const reportData = {
        category: formData.category,
        description: formData.description.trim(),
        severity: formData.severity,
        incident_date: new Date(formData.incident_date).toISOString(),
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      };

      await crimeService.reportCrime(reportData);
      toast.success('Crime report submitted successfully. Thank you for helping keep others safe! 🛡️');
      onClose();
    } catch (error) {
      console.error('Crime report submission error:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationUpdate = () => {
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      }));
      toast.success('Location updated to current position');
    } else {
      toast.error('Current location not available');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <span>Report Crime</span>
          </h3>
          <p className="text-sm text-gray-600">Help keep the community safe</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <FiX className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crime Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type of Incident <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {crimeCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.category === category.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-gray-900">{category.label}</span>
                </div>
                <p className="text-xs text-gray-600">{category.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Severity Level <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {severityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.severity === level.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.color} mr-2`}>
                      {level.label}
                    </span>
                    <span className="text-sm text-gray-900">{level.description}</span>
                  </div>
                  {formData.severity === level.value && (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="input resize-none"
            placeholder="Please provide details about what happened, when, and any other relevant information..."
            maxLength={1000}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Date and Time */}
        <div>
          <label htmlFor="incident_date" className="block text-sm font-medium text-gray-700 mb-2">
            When did this occur? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              id="incident_date"
              type="datetime-local"
              value={formData.incident_date}
              onChange={(e) => setFormData(prev => ({ ...prev, incident_date: e.target.value }))}
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                  className="input"
                  placeholder="Latitude"
                  required
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                  className="input"
                  placeholder="Longitude"
                  required
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleLocationUpdate}
              className="w-full flex items-center justify-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <FiMapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Use Current Location</span>
            </button>
          </div>
        </div>

        {/* Anonymous Reporting Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Anonymous Reporting</h4>
              <p className="text-sm text-yellow-700">
                This report is anonymous and helps create safer routes for everyone. 
                For emergencies, please contact local authorities immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-danger py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Report...</span>
            </div>
          ) : (
            'Submit Crime Report'
          )}
        </button>
      </form>

      {/* Emergency Contact */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-sm font-medium text-red-800 mb-2">Need Immediate Help?</h4>
        <p className="text-sm text-red-700 mb-3">
          If you're in immediate danger, contact emergency services right away.
        </p>
        <div className="flex space-x-2">
          <a
            href="tel:911"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Call 911
          </a>
          <a
            href="sms:911"
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Text 911
          </a>
        </div>
      </div>
    </div>
  );
};

export default CrimeReportForm; 