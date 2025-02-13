import { Router } from 'express';
const router = Router();

// controllers
import { imageBCompress, imagePCompress } from '../controllers/imageController.js';

// Validators
// import { imageValidation } from '../validators/imageValidator.js';

//  Image route, it'll first validate (File Type) & then will perform the required image Optimization / Compression and later update that image in the source (DB in our case)

// slug - to determine which blog's featured image to compress
router.get('/img/blog/photo/:slug', imageBCompress);

// username - to find the user profile photo image to compress
// router.get('/img/user/photo/:username', imagePCompress);

//------------------------------------

export default router;