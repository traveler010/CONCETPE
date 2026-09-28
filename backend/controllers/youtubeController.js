/**
 * CONCEPTPE — YouTube Controller
 * Handles GET /api/youtube/videos
 */

const youtubeService = require('../services/youtubeService');
const videoService = require('../services/videoService');

const getChannelVideos = async (req, res) => {
  const channelUrl = "https://www.youtube.com/@Conceptpe";

  try {
    const result = await youtubeService.getLatestVideos();

    return res.status(200).json({
      success: true,
      cached: result.cached,
      channelUrl,
      count: result.videos.length,
      videos: result.videos
    });
  } catch (err) {
    console.warn('[YouTube API Notice] Falling back to curated video catalog:', err.message);

    try {
      const fallbackVideos = await videoService.getAllVideos();
      const formattedVideos = fallbackVideos.map(v => ({
        id: v.id,
        title: v.title,
        description: v.description,
        thumbnail: '',
        thumbnailFormula: v.thumbnailFormula,
        thumbnailTopic: v.thumbnailTopic,
        category: v.category,
        duration: v.duration,
        level: v.level,
        publishedAt: null,
        videoUrl: v.youtubeUrl || channelUrl
      }));

      return res.status(200).json({
        success: true,
        fallback: true,
        channelUrl,
        count: formattedVideos.length,
        videos: formattedVideos
      });
    } catch (fallbackErr) {
      // Provide structured error response if fallback also fails
      return res.status(err.code === 'NO_API_KEY' ? 503 : 502).json({
        success: false,
        error: "Unable to load videos right now. Visit CONCEPTPE on YouTube.",
        details: err.message,
        channelUrl,
        videos: []
      });
    }
  }
};

module.exports = {
  getChannelVideos
};
