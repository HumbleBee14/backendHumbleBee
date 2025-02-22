import { Router } from 'express';
const router = Router();

import { requireSignin, authMiddleware } from '../controllers/authController.js';
import { read, publicProfile, update, photo } from '../controllers/userController.js';
 
// Private Profile
router.get('/user/profile', requireSignin, authMiddleware, read); // For Private Profile (for Update/Delete, for user to manage his profile )
// router.get('/profile', requireSignin, adminMiddleware, read);

// Public Profile
router.get('/user/:username', publicProfile); // For Public Profile (which will be visible to all, could be used for showing contact details, blogs of that user, etc) 

// Update User profile details
router.put('/user/update/', requireSignin, authMiddleware, update);

// get User Profile Photos
router.get('/user/photo/:username', photo);

export default router;