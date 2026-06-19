const express = require('express');
const router = express.Router();
const { getProfile, getProjects, getSkills } = require('../controllers/portfolioController');
const { submitContactForm } = require('../controllers/contactController');
const { validateContactInput } = require('../middleware/validation');

// Portfolio content API routes
router.get('/profile', getProfile);
router.get('/projects', getProjects);
router.get('/skills', getSkills);

// Contact submission route with express-validation middleware
router.post('/contact', validateContactInput, submitContactForm);

module.exports = router;
