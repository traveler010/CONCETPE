/**
 * CONCEPTPE — YouTube Data API v3 Service
 * Integrates with YouTube Data API v3 to retrieve channel videos
 * Implements in-memory caching to optimize API quota usage
 */

const config = require('../config/environment');

class YouTubeService {
  constructor() {
    this.cache = {
      timestamp: 0,
      videos: null,
      channelId: null,
      uploadsPlaylistId: null
    };
    this.cacheDurationMs = (config.youtube.cacheMinutes || 30) * 60 * 1000;
  }

  /**
   * Checks whether a valid YouTube API key is configured
   */
  hasValidApiKey() {
    const key = config.youtube.apiKey;
    return Boolean(key && key.trim() !== '' && key !== 'YOUR_KEY_HERE');
  }

  /**
   * Resolves the channel ID and uploads playlist ID from the handle or config
   */
  async resolveChannelInfo() {
    if (this.cache.channelId && this.cache.uploadsPlaylistId) {
      return {
        channelId: this.cache.channelId,
        uploadsPlaylistId: this.cache.uploadsPlaylistId
      };
    }

    const apiKey = config.youtube.apiKey;
    const configuredId = config.youtube.channelId;
    const handle = config.youtube.channelHandle;

    // 1. If channelId is configured in .env, retrieve its uploads playlist
    if (configuredId && configuredId.trim() !== '') {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(configuredId)}&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        this.cache.channelId = configuredId;
        this.cache.uploadsPlaylistId = data.items[0].contentDetails?.relatedPlaylists?.uploads;
        return {
          channelId: this.cache.channelId,
          uploadsPlaylistId: this.cache.uploadsPlaylistId
        };
      }
    }

    // 2. Resolve via handle (e.g. forHandle=Conceptpe)
    if (handle) {
      const handleUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
      const res = await fetch(handleUrl);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        this.cache.channelId = data.items[0].id;
        this.cache.uploadsPlaylistId = data.items[0].contentDetails?.relatedPlaylists?.uploads;
        return {
          channelId: this.cache.channelId,
          uploadsPlaylistId: this.cache.uploadsPlaylistId
        };
      }

      // 3. Fallback search for channel by name
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${apiKey}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.items && searchData.items.length > 0) {
        const foundId = searchData.items[0].snippet?.channelId || searchData.items[0].id?.channelId;
        if (foundId) {
          this.cache.channelId = foundId;
          // Get uploads playlist
          const chRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(foundId)}&key=${apiKey}`);
          const chData = await chRes.json();
          if (chData.items && chData.items.length > 0) {
            this.cache.uploadsPlaylistId = chData.items[0].contentDetails?.relatedPlaylists?.uploads;
          }
          return {
            channelId: this.cache.channelId,
            uploadsPlaylistId: this.cache.uploadsPlaylistId
          };
        }
      }
    }

    throw new Error(`Unable to resolve YouTube channel for handle '@${handle}'.`);
  }

  /**
   * Retrieves the latest videos from the channel
   */
  async getLatestVideos() {
    // 1. Check in-memory cache
    const now = Date.now();
    if (this.cache.videos && (now - this.cache.timestamp) < this.cacheDurationMs) {
      return {
        cached: true,
        videos: this.cache.videos
      };
    }

    // 2. Validate API key
    if (!this.hasValidApiKey()) {
      const err = new Error('YouTube API key is not configured. Set YOUTUBE_API_KEY in backend/.env');
      err.code = 'NO_API_KEY';
      throw err;
    }

    // 3. Resolve channel and uploads playlist ID
    const { uploadsPlaylistId, channelId } = await this.resolveChannelInfo();
    const apiKey = config.youtube.apiKey;

    let items = [];

    // Method A: PlaylistItems (1 quota cost - optimal)
    if (uploadsPlaylistId) {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=12&key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message || 'YouTube Data API error');
      }

      if (data.items) {
        items = data.items.map(item => {
          const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
          return {
            id: videoId,
            title: item.snippet?.title,
            description: item.snippet?.description,
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
            publishedAt: item.snippet?.publishedAt,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
          };
        });
      }
    } else {
      // Method B: Search (fallback)
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=date&type=video&maxResults=12&key=${apiKey}`;
      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message || 'YouTube Data API error');
      }

      if (data.items) {
        items = data.items.map(item => {
          const videoId = item.id?.videoId;
          return {
            id: videoId,
            title: item.snippet?.title,
            description: item.snippet?.description,
            thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
            publishedAt: item.snippet?.publishedAt,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`
          };
        });
      }
    }

    // Filter out deleted/private items if any
    const validVideos = items.filter(v => v.id && v.title !== 'Private video' && v.title !== 'Deleted video');

    // Update cache
    this.cache.videos = validVideos;
    this.cache.timestamp = now;

    return {
      cached: false,
      videos: validVideos
    };
  }

  /**
   * Clears the in-memory cache
   */
  clearCache() {
    this.cache.videos = null;
    this.cache.timestamp = 0;
  }
}

module.exports = new YouTubeService();
