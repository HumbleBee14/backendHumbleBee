const { check } = require('express-validator');

// SignUp Validator
exports.userSignupValidator = [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),

  check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),

  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];


// SignIn Validator

exports.userSigninValidator = [

  check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),

  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];



// Forgot Password Form (email) Validator

exports.forgotPasswordValidator = [

  check('email')
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Must be a valid email address')
];


// Reset Password Validator // (use regex for more complex validations)

exports.resetPasswordValidator = [

  check('newPassword')
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')

];