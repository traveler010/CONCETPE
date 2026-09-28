/**
 * Health Controller
 * Provides health check endpoint for monitoring system status
 */

const getHealth = (req, res) => {
  res.status(200).json({
    status: "ok"
  });
};

module.exports = {
  getHealth
};
