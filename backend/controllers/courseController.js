/**
 * Course Controller
 * Handles GET /api/courses and GET /api/courses/:id
 */

const courseService = require('../services/courseService');

const getCourses = async (req, res, next) => {
  try {
    const { category } = req.query;
    const courses = await courseService.getAllCourses(category);
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with id '${id}' not found.`
      });
    }
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  getCourseById
};
