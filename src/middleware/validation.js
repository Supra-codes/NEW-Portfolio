const { body, validationResult } = require('express-validator');

const validateContactInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  
  body('subject')
    .trim()
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters.')
    .optional({ checkFalsy: true }),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message content is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters.'),
  
  // Handler middleware to return error validation format
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

module.exports = {
  validateContactInput
};
