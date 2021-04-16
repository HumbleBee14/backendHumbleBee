const { check } = require('express-validator');

// Tags validator
exports.tagCreateValidator = [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Tag Name is required')
];

