import { Router } from 'express';
const router = Router();
import { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteBlog } from "../controllers/authController.js";

import { create, list, listAllBlogsCategoriesTags, read, remove, update, photo, listRelatedBlogs, listSearch, listBlogsByUser } from '../controllers/blogController.js';



//  ======================================================================================

// Crete a new Blog route (for ADMIN)
router.post('/blog', requireSignin, adminMiddleware, create);

router.get('/blogs', list); // get / list all the blogs of every author [this API is used by BLOG MANAGE Page to get list of all the Blogs available in DB]

router.post('/blogs-categories-tags', listAllBlogsCategoriesTags); // [using this for /blogs page] to get all the blogs alongwith all the Categories & tags also (useful for SEO optimization)
// NOTE: Note that the above request is POST method, why? Because we'll get some parameters from client side so that we'll not load all the blogs at once, but few only and than will Load More as requested. (Some queries will be Passed to sort the Listing). i.e will be used with 'PAGINATION'

router.get('/blog/:slug', read); // get a single blog 

// router.get('/blogs/:slug', read); // get a single blog (from all blogs list)  

router.delete('/blog/:slug', requireSignin, adminMiddleware, remove); // remove a single blog

router.put('/blog/:slug', requireSignin, adminMiddleware, update); // Update blog

// To get featured image photos of blogs
router.get('/blog/photo/:slug', photo);

router.post('/blogs/related', listRelatedBlogs);

router.get('/blogs/search', listSearch); // for Searching Blogs



//===================================================

// Auth User (For Non-Admin Regular Authorized Users)

// Auth user blog crud - create a new blog (for Authorized users)
router.post('/user/blog', requireSignin, authMiddleware, create);

// Pull all the blogs by a specific user
router.get('/:username/blogs', listBlogsByUser); //  get / list all the blogs by that User (based on username)

router.delete('/user/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, remove); // Remove/Delete a single blog (for Auth user)

router.put('/user/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, update); // Update blog (for Auth user)

// canUpdateDeleteBlog --> middleware to check if the currently loggedin user is authorized to update / remove/delete this blog

// ------------------------------------------------------

export default router;


// ################## NOTE #################
/*
Note that we haven't added authorization middleware for get request of blogs and photos, why?

Because there is nothing as such in those that will manipulate the DB database records and any user/even search engine(SEO) will be reading that, therefore no authentication parameter is defined on that. Chill !!
So a normal http url request (which is by default GET) will directly give you the results
*/