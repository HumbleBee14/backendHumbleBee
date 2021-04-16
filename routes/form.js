
const express = require('express');
const router = express.Router();
const { contactForm, contactBlogAuthorForm } = require('../controllers/formController');


// validators
const { runValidation } = require('../validators/index'); // to catch & show validation errors/alerts
// const { runValidation } = require('../validators'); // not mentioning 'index' file is equal to mentioning
const { contactFormValidator } = require('../validators/formValidator');



// Middlewares

router.post('/contact', contactFormValidator, runValidation, contactForm);

router.post('/contact-blog-author', contactFormValidator, runValidation, contactBlogAuthorForm); // To Contact Blog Author directly




module.exports = router;