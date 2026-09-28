/**
 * Resource Controller
 * Handles GET /api/resources and GET /api/resources/:id
 */

const resourceService = require('../services/resourceService');

const getResources = async (req, res, next) => {
  try {
    const { category } = req.query;
    const resources = await resourceService.getAllResources(category);
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await resourceService.getResourceById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: `Resource with id '${id}' not found.`
      });
    }
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getResources,
  getResourceById
};
