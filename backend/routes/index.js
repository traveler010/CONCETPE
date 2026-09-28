const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const courseRoutes = require('./courseRoutes');
const videoRoutes = require('./videoRoutes');
const resourceRoutes = require('./resourceRoutes');
const contactRoutes = require('./contactRoutes');
const youtubeRoutes = require('./youtubeRoutes');

router.use('/health', healthRoutes);
router.use('/courses', courseRoutes);
router.use('/videos', videoRoutes);
router.use('/resources', resourceRoutes);
router.use('/contact', contactRoutes);
router.use('/youtube', youtubeRoutes);

module.exports = router;
