
import { Router } from 'express';
const router = Router();
import { contactForm, contactBlogAuthorForm } from '../controllers/formController.js';


// validators
import { runValidation } from '../validators/index.js'; // to catch & show validation errors/alerts
import { contactFormValidator } from '../validators/formValidator.js';


// Middlewares
router.post('/contact', contactFormValidator, runValidation, contactForm);

router.post('/contact-blog-author', contactFormValidator, runValidation, contactBlogAuthorForm); // To Contact Blog Author directly


export default router;