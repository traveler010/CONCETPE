const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');

router.get('/videos', youtubeController.getChannelVideos);

module.exports = router;
