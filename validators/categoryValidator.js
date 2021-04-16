const { check } = require('express-validator')

// Category Validator
exports.categoryCreateValidator = [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Category Name is required')

];

