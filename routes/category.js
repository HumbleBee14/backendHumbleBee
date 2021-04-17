const express = require('express');
const router = express.Router();
const { create, list, read, remove } = require('../controllers/categoryController');


// validators
const { runValidation } = require('../validators/index');
const { categoryCreateValidator } = require('../validators/categoryValidator');

const { requireSignin, adminMiddleware } = require('../controllers/authController');

// Create Category route, it'll first validate & check for authetication & role (admin) and then will Create the category in db
router.post('/category', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);


//------------------------------------
// to get all the categories
router.get('/categories', list);

// to get the single category (& return all the blogs with that category)
router.get('/category/:slug', read);       // Note: we aren't using ID, but slug - SEO optimized

// to delete/remove category
router.delete('/category/:slug', requireSignin, adminMiddleware, remove);




module.exports = router;