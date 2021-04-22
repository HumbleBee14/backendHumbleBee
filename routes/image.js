const express = require('express');
const router = express.Router();

// controllers
const { imageBCompress, imagePCompress } = require('../controllers/imageController');


// validators
// const { imageValidation } = require('../validators/imageValidator');

//  Image route, it'll first validate (File Type) & then will perform the required image Optimization / Compression and later update that image in the source (DB in our case)

// slug - to determine which blog's featured image to compress
router.get('/img/blog/photo/:slug', imageBCompress);

// username - to find the user profile photo image to compress
// router.get('/img/user/photo/:username', imagePCompress);

//------------------------------------

module.exports = router;
