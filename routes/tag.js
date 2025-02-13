import { Router } from 'express';
const router = Router();

// controllers
import { create, list, read, remove } from '../controllers/tagController.js';
import { requireSignin, adminMiddleware } from '../controllers/authController.js';

// validators
import { runValidation } from '../validators/index.js';
import { tagCreateValidator } from '../validators/tagValidator.js';


// Create Tag route, it'll first validate & check for authetication & role (admin) and then will Create the TAGS in db
router.post('/tag', tagCreateValidator, runValidation, requireSignin, adminMiddleware, create);

//------------------------------------
// to get all the Tags
router.get('/tags', list);


// to get the single tag
// router.get('/tag/:tagName', read); 
router.get('/tag/:slug', read);       // Note: we aren't using ID, but slug - SEO optimized

// to delete/remove tag
// router.delete('/tag/:tagName', requireSignin, adminMiddleware, remove);
router.delete('/tag/:slug', requireSignin, adminMiddleware, remove);


export default router;
