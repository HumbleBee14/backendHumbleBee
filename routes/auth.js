const express = require('express');
const router = express.Router();

const { preSignup, signup, signin, signout, requireSignin, forgotPassword, resetPassword, googleLogin } = require('../controllers/authController');

// validators
const { runValidation } = require('../validators/index');
const { userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/authValidator');

// Routes With validators

router.post('/preSignup', userSignupValidator, runValidation, preSignup); // for pre signup (whihc will first send email for confirmation before creating the account in DB)
router.post('/signup', signup); // Note: I have removed validators from signup because we have already validated in preSignup
router.post('/signup', userSignupValidator, runValidation, signup);

router.post('/signin', userSigninValidator, runValidation, signin);

router.get('/signout', signout);

// Forgot Password endpoint API Route
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);

// Reset Password endpoint API Route
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);


// ------------------------------

// Google Login
router.post('/google-login', googleLogin);


/*
// test
router.get('/secret', requireSignin, (req, res) => {
  res.json({
    message: "you have access to Secret Page (Logged In User)",
    user: req.user
  });
});
*/

module.exports = router;