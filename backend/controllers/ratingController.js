const { Rating, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const rateRoute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { lat, lng, safety_score, comment, route_type } = req.body;

    // Determine time of day and day of week
    const now = new Date();
    const hour = now.getHours();
    let time_of_day;

    if (hour >= 6 && hour < 12) time_of_day = 'morning';
    else if (hour >= 12 && hour < 17) time_of_day = 'afternoon';
    else if (hour >= 17 && hour < 21) time_of_day = 'evening';
    else time_of_day = 'night';

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const day_of_week = days[now.getDay()];

    const rating = await Rating.create({
      user_id: req.user.id,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      safety_score: parseInt(safety_score),
      comment: comment || null,
      time_of_day,
      day_of_week,
      route_type: route_type || 'walking'
    });

    res.status(201).json({
      success: true,
      message: 'Route rated successfully',
      data: {
        rating: {
          id: rating.id,
          lat: rating.lat,
          lng: rating.lng,
          safety_score: rating.safety_score,
          comment: rating.comment,
          time_of_day: rating.time_of_day,
          day_of_week: rating.day_of_week,
          route_type: rating.route_type
        }
      }
    });

  } catch (error) {
    console.error('Rate route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getSafetyHeatmap = async (req, res) => {
  try {
    const { lat, lng, radius = 0.02 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Get ratings within the specified radius
    const ratings = await Rating.findAll({
      where: {
        lat: {
          [Op.between]: [latitude - searchRadius, latitude + searchRadius]
        },
        lng: {
          [Op.between]: [longitude - searchRadius, longitude + searchRadius]
        },
        // Only consider ratings from the last 90 days
        createdAt: {
          [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: ['lat', 'lng', 'safety_score', 'time_of_day'],
      order: [['createdAt', 'DESC']]
    });

    // Group ratings by approximate grid cells for heatmap
    const gridSize = 0.001; // Approximately 100m grid cells
    const heatmapData = {};

    ratings.forEach(rating => {
      const gridLat = Math.round(rating.lat / gridSize) * gridSize;
      const gridLng = Math.round(rating.lng / gridSize) * gridSize;
      const key = `${gridLat},${gridLng}`;

      if (!heatmapData[key]) {
        heatmapData[key] = {
          lat: gridLat,
          lng: gridLng,
          scores: [],
          count: 0
        };
      }

      heatmapData[key].scores.push(rating.safety_score);
      heatmapData[key].count++;
    });

    // Calculate average scores and create heatmap points
    const heatmapPoints = Object.values(heatmapData).map(cell => {
      const avgScore = cell.scores.reduce((sum, score) => sum + score, 0) / cell.scores.length;
      const intensity = avgScore / 5; // Normalize to 0-1

      return {
        lat: cell.lat,
        lng: cell.lng,
        intensity,
        averageScore: Math.round(avgScore * 10) / 10,
        ratingCount: cell.count
      };
    });

    res.json({
      success: true,
      data: {
        heatmapPoints,
        center: { lat: latitude, lng: longitude },
        radius: searchRadius,
        totalRatings: ratings.length
      }
    });

  } catch (error) {
    console.error('Get safety heatmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getLocationRatings = async (req, res) => {
  try {
    const { lat, lng, radius = 0.005 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    const ratings = await Rating.findAll({
      where: {
        lat: {
          [Op.between]: [latitude - searchRadius, latitude + searchRadius]
        },
        lng: {
          [Op.between]: [longitude - searchRadius, longitude + searchRadius]
        }
      },
      attributes: [
        'id', 'lat', 'lng', 'safety_score', 'comment', 
        'time_of_day', 'route_type', 'createdAt'
      ],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Calculate average safety score
    const totalScore = ratings.reduce((sum, rating) => sum + rating.safety_score, 0);
    const averageScore = ratings.length > 0 ? totalScore / ratings.length : 0;

    res.json({
      success: true,
      data: {
        ratings,
        averageScore: Math.round(averageScore * 10) / 10,
        totalRatings: ratings.length,
        location: { lat: latitude, lng: longitude }
      }
    });

  } catch (error) {
    console.error('Get location ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  rateRoute,
  getSafetyHeatmap,
  getLocationRatings
}; 