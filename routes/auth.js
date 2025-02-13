import { Router } from 'express';
const router = Router();

import { preSignup, signup, signin, signout, requireSignin, forgotPassword, resetPassword, googleLogin } from '../controllers/authController.js';

// validators
import { runValidation } from '../validators/index.js';
import { userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/authValidator.js';

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

export default router;