/**
 * Video Controller
 * Handles GET /api/videos and GET /api/videos/:id
 */

const videoService = require('../services/videoService');

const getVideos = async (req, res, next) => {
  try {
    const { category } = req.query;
    const videos = await videoService.getAllVideos(category);
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (err) {
    next(err);
  }
};

const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await videoService.getVideoById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: `Video with id '${id}' not found.`
      });
    }
    res.status(200).json({
      success: true,
      data: video
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVideos,
  getVideoById
};
