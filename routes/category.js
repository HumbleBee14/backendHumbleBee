import { Router } from 'express';
const router = Router();
import { create, list, read, remove } from '../controllers/categoryController.js';

// validators
import { runValidation } from '../validators/index.js';
import { categoryCreateValidator } from '../validators/categoryValidator.js';
import { requireSignin, adminMiddleware } from '../controllers/authController.js';

// Create Category route, it'll first validate & check for authetication & role (admin) and then will Create the category in db
router.post('/category', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);

//------------------------------------
// to get all the categories
router.get('/categories', list);

// to get the single category (& return all the blogs with that category)
router.get('/category/:slug', read);       // Note: we aren't using ID, but slug - SEO optimized

// to delete/remove category
router.delete('/category/:slug', requireSignin, adminMiddleware, remove);


export default router;