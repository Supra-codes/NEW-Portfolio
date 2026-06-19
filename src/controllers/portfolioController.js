const { Profile, Project, Skill } = require('../models');

// Fetch profile information
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.get();
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

// Fetch projects list (with optional ?featured=true filter)
const getProjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.featured === 'true') {
      filter.featured = true;
    } else if (req.query.featured === 'false') {
      filter.featured = false;
    }

    const projects = await Project.find(filter);
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    next(err);
  }
};

// Fetch skills list
const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find();
    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  getProjects,
  getSkills
};
