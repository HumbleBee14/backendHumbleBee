const express = require('express');
const router = express.Router();

// controllers
const { create, list, read, remove } = require('../controllers/tagController');
const { requireSignin, adminMiddleware } = require('../controllers/authController');

// validators
const { runValidation } = require('../validators/index');
const { tagCreateValidator } = require('../validators/tagValidator');


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


module.exports = router;
